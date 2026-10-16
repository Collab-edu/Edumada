<?php

namespace Tests\Feature\Api\V1;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Enums\PlanCode;
use App\Models\Inquiry;
use App\Models\Offer;
use App\Notifications\InquiryStatusChanged;
use App\Notifications\NewInquiryReceived;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InquiryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
        Notification::fake();
    }

    public function test_student_sends_an_information_request_that_reaches_the_establishment(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $offer = Offer::factory()->for($establishment)->create();
        $student = $this->student();

        $this->actingAs($student)->postJson("/api/v1/offers/{$offer->slug}/inquiries", [
            'type' => 'information',
            'message' => 'Quelles sont les dates de rentrée ?',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.establishment.id', $establishment->slug)
            ->assertJsonPath('data.name', 'Fanja Rakoto');

        $this->assertDatabaseHas('inquiries', ['user_id' => $student->id, 'establishment_id' => $establishment->id, 'type' => 'information']);
        Notification::assertSentTo($owner, NewInquiryReceived::class, fn (NewInquiryReceived $notification) => $notification->hasInbox === false);
        Notification::assertSentTo(new AnonymousNotifiable, NewInquiryReceived::class, fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'contact@etablissement.mg');
    }

    public function test_establishment_account_cannot_send_a_request_403(): void
    {
        [$owner] = $this->establishmentOwner();
        $offer = Offer::factory()->create();

        $this->actingAs($owner)->postJson("/api/v1/offers/{$offer->slug}/inquiries", ['type' => 'information', 'message' => 'Bonjour'])
            ->assertForbidden();
    }

    public function test_application_is_refused_when_online_application_is_disabled_422(): void
    {
        $offer = Offer::factory()->create(['online_application' => false]);

        $this->actingAs($this->student())->postJson("/api/v1/offers/{$offer->slug}/inquiries", ['type' => 'application'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type' => 'La candidature en ligne n\'est pas activée pour cette offre. Envoyez plutôt une demande d\'information.']);
    }

    public function test_application_stores_attachments_privately_and_blocks_a_second_application(): void
    {
        Storage::fake('local');
        $offer = Offer::factory()->create(['online_application' => true]);
        $student = $this->student();

        $this->actingAs($student)->post("/api/v1/offers/{$offer->slug}/inquiries", [
            'type' => 'application',
            'attachments' => [UploadedFile::fake()->create('releve-de-notes.pdf', 200, 'application/pdf')],
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('data.attachments.0.name', 'releve-de-notes.pdf');

        $inquiry = Inquiry::firstOrFail();
        Storage::disk('local')->assertExists($inquiry->attachments->first()->path);

        $this->actingAs($student)->postJson("/api/v1/offers/{$offer->slug}/inquiries", ['type' => 'application'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type' => 'Vous avez déjà une candidature en cours pour cette offre.']);
    }

    public function test_student_only_sees_own_inquiries(): void
    {
        $offer = Offer::factory()->create();
        $author = $this->student();
        $inquiry = Inquiry::create([
            'type' => InquiryType::Information, 'user_id' => $author->id, 'establishment_id' => $offer->establishment_id,
            'offer_id' => $offer->id, 'name' => $author->name, 'email' => $author->email, 'message' => 'Bonjour',
        ]);

        $this->actingAs($author)->getJson('/api/v1/me/inquiries')->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($this->student())->getJson("/api/v1/inquiries/{$inquiry->id}")->assertNotFound();
    }

    public function test_free_establishment_has_no_inbox_403_with_explanation(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();

        $this->actingAs($owner)->getJson("/api/v1/establishments/{$establishment->slug}/inquiries")
            ->assertForbidden()
            ->assertJsonPath('message', 'La boîte de réception des demandes est incluse dans les formules Pro et Premium. Avec la formule Gratuit, chaque demande vous est envoyée par e-mail.');
    }

    public function test_pro_establishment_processes_an_inquiry_and_the_student_is_notified(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        $offer = Offer::factory()->for($establishment)->create();
        $student = $this->student();
        $inquiry = Inquiry::create([
            'type' => InquiryType::Information, 'user_id' => $student->id, 'establishment_id' => $establishment->id,
            'offer_id' => $offer->id, 'name' => $student->name, 'email' => $student->email, 'message' => 'Bonjour',
        ]);

        $this->actingAs($owner)->getJson("/api/v1/establishments/{$establishment->slug}/inquiries")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('counts.new', 1);

        $this->actingAs($owner)->putJson("/api/v1/inquiries/{$inquiry->id}/status", ['status' => 'interview', 'note' => 'Entretien mardi à 10 h.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'interview')
            ->assertJsonPath('data.history.0.toLabel', 'Entretien');

        $this->assertSame(InquiryStatus::Interview, $inquiry->refresh()->status);
        Notification::assertSentTo($student, InquiryStatusChanged::class);
    }

    public function test_other_establishment_cannot_read_an_inquiry_404(): void
    {
        [, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        [$intruder] = $this->establishmentOwner(PlanCode::Pro);
        $student = $this->student();
        $inquiry = Inquiry::create([
            'type' => InquiryType::Information, 'user_id' => $student->id, 'establishment_id' => $establishment->id,
            'name' => $student->name, 'email' => $student->email, 'message' => 'Bonjour',
        ]);

        $this->actingAs($intruder)->getJson("/api/v1/inquiries/{$inquiry->id}")->assertNotFound();
        $this->actingAs($intruder)->putJson("/api/v1/inquiries/{$inquiry->id}/status", ['status' => 'refused'])->assertNotFound();
    }

    public function test_export_returns_csv_and_is_audited(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        Inquiry::create([
            'type' => InquiryType::Information, 'establishment_id' => $establishment->id,
            'name' => 'Hery R.', 'email' => 'hery@example.mg', 'message' => 'Bonjour',
        ]);

        $response = $this->actingAs($owner)->get("/api/v1/establishments/{$establishment->slug}/inquiries/export");

        $response->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('hery@example.mg', $response->streamedContent());
        $this->assertDatabaseHas('audit_logs', ['action' => 'inquiries.exported', 'user_id' => $owner->id]);
    }
}
