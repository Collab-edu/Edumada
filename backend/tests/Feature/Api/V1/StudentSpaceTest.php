<?php

namespace Tests\Feature\Api\V1;

use App\Enums\InquiryType;
use App\Enums\ReviewStatus;
use App\Models\Establishment;
use App\Models\Inquiry;
use App\Models\Offer;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Espace étudiant : favoris, avis, profil et suppression du compte.
 */
class StudentSpaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_adds_lists_and_removes_favorites(): void
    {
        $student = $this->student();
        $offer = Offer::factory()->create();

        $this->actingAs($student)->putJson("/api/v1/me/favorites/{$offer->slug}")->assertNoContent();
        $this->actingAs($student)->getJson('/api/v1/me/favorites')->assertOk()->assertJsonPath('data.0.id', $offer->slug);
        $this->actingAs($student)->deleteJson("/api/v1/me/favorites/{$offer->slug}")->assertNoContent();

        $this->assertSame(0, $student->favoriteOffers()->count());
    }

    public function test_draft_offer_cannot_be_added_to_favorites_404(): void
    {
        $offer = Offer::factory()->draft()->create();

        $this->actingAs($this->student())->putJson("/api/v1/me/favorites/{$offer->slug}")->assertNotFound();
    }

    public function test_student_review_waits_for_moderation(): void
    {
        $establishment = Establishment::factory()->create();

        $this->actingAs($this->student())->postJson("/api/v1/establishments/{$establishment->slug}/reviews", [
            'rating' => 4,
            'quote' => 'Des enseignants disponibles et des cours très concrets.',
        ])->assertCreated();

        $review = Review::firstOrFail();
        $this->assertSame(ReviewStatus::Pending, $review->status);
        $this->assertSame('Fanja R.', $review->author_name);
        $this->getJson('/api/v1/reviews')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_profile_update_changes_contact_details(): void
    {
        $student = $this->student();

        $this->actingAs($student)->patchJson('/api/v1/me', ['city' => 'Toamasina', 'studyLevel' => 'BAC+2'])
            ->assertOk()
            ->assertJsonPath('data.city', 'Toamasina')
            ->assertJsonPath('data.studyLevel', 'BAC+2');
    }

    public function test_account_deletion_removes_the_students_inquiries(): void
    {
        $student = $this->student();
        $offer = Offer::factory()->create();
        Inquiry::create([
            'type' => InquiryType::Information, 'user_id' => $student->id, 'establishment_id' => $offer->establishment_id,
            'name' => $student->name, 'email' => $student->email, 'message' => 'Bonjour',
        ]);

        $this->actingAs($student)->deleteJson('/api/v1/me', ['password' => 'password'])->assertNoContent();

        $this->assertModelMissing($student);
        $this->assertSame(0, Inquiry::count());
    }

    public function test_account_deletion_requires_the_password_422(): void
    {
        $student = $this->student();

        $this->actingAs($student)->deleteJson('/api/v1/me', ['password' => 'mauvais'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_anyone_can_report_wrong_information(): void
    {
        $establishment = Establishment::factory()->create();

        $this->postJson('/api/v1/reports', [
            'establishment' => $establishment->slug,
            'reason' => 'fees',
            'message' => 'Les frais affichés datent de l\'an dernier.',
        ])->assertCreated();

        $this->assertDatabaseHas('reports', ['establishment_id' => $establishment->id, 'reason' => 'fees', 'status' => 'open']);
    }

    public function test_anyone_can_send_a_contact_message(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Hery Rakoto',
            'email' => 'hery@example.mg',
            'phone' => '+261 34 12 345 67',
            'subject' => 'orientation',
            'message' => 'Bonjour, je cherche une formation en informatique.',
        ])->assertCreated();

        $this->assertDatabaseHas('contact_messages', ['email' => 'hery@example.mg', 'subject' => 'orientation', 'status' => 'open']);
    }

    public function test_contact_message_requires_name_email_subject_and_message(): void
    {
        $this->postJson('/api/v1/contact', ['email' => 'pas-un-email', 'subject' => 'inconnu'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
    }
}
