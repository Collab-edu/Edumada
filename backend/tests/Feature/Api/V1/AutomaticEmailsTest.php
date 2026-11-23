<?php

namespace Tests\Feature\Api\V1;

use App\Enums\EstablishmentMemberRole;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\Internship;
use App\Models\User;
use App\Notifications\ContactMessageAcknowledged;
use App\Notifications\InternshipApplicationReceived;
use App\Notifications\TeamAlert;
use App\Notifications\WelcomeToEdumada;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * E-mails automatiques envoyés depuis noreply@ : accusés de réception aux personnes,
 * alertes à l'équipe (contact@edumada.mg) quand une action attend un traitement.
 */
class AutomaticEmailsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        config(['edumada.contact_email' => 'contact@edumada.mg']);
    }

    private function assertTeamAlerted(string $subject, string $path): void
    {
        Notification::assertSentTo(
            new AnonymousNotifiable,
            TeamAlert::class,
            fn (TeamAlert $alert, array $channels, AnonymousNotifiable $notifiable): bool => $notifiable->routes['mail'] === 'contact@edumada.mg'
                && str_starts_with($alert->subject, $subject)
                && $alert->path === $path,
        );
    }

    public function test_contact_form_sends_an_acknowledgement_to_the_visitor(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Rova',
            'email' => 'rova@example.com',
            'subject' => 'orientation',
            'message' => 'Quelle école pour faire de l’informatique ?',
        ])->assertCreated();

        Notification::assertSentTo(
            new AnonymousNotifiable,
            ContactMessageAcknowledged::class,
            fn ($notification, array $channels, AnonymousNotifiable $notifiable): bool => $notifiable->routes['mail'] === 'rova@example.com',
        );
    }

    public function test_student_signup_sends_a_welcome_email_and_no_team_alert(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Fanja Rakoto',
            'email' => 'fanja@example.mg',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => 'student',
        ])->assertCreated();

        $student = User::firstWhere('email', 'fanja@example.mg');
        Notification::assertSentTo($student, WelcomeToEdumada::class, fn (WelcomeToEdumada $mail): bool => $mail->establishment === null);
        Notification::assertNotSentTo(new AnonymousNotifiable, TeamAlert::class);
    }

    public function test_establishment_signup_welcomes_the_owner_and_alerts_the_team(): void
    {
        Category::factory()->create(['slug' => 'formation-pro']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Hery Randria',
            'firstName' => 'Hery',
            'lastName' => 'Randria',
            'jobTitle' => 'Responsable des admissions',
            'email' => 'hery@institut.mg',
            'phone' => '034 00 000 00',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => 'establishment',
            'establishment' => ['name' => 'Institut des Métiers', 'category' => 'formation-pro', 'city' => 'Toliara'],
        ])->assertCreated();

        $owner = User::firstWhere('email', 'hery@institut.mg');
        Notification::assertSentTo($owner, WelcomeToEdumada::class, fn (WelcomeToEdumada $mail): bool => $mail->establishment?->name === 'Institut des Métiers');
        $this->assertTeamAlerted('Nouvel établissement à valider', '/admin/moderation/');
    }

    public function test_internship_application_confirms_to_the_student_and_alerts_the_team(): void
    {
        Storage::fake('local');
        $internship = new Internship(['company_name' => 'Société Vanille', 'title' => 'Stage', 'city' => 'Antsirabe', 'modality' => 'Présentiel', 'registration' => 'Ouvertes', 'status' => 'published']);
        $internship->slug = 'stage';
        $internship->save();
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', [
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'letter' => UploadedFile::fake()->create('lettre.pdf', 100, 'application/pdf'),
            'phone' => '034 00 000 00',
        ])->assertCreated();

        Notification::assertSentTo($student, InternshipApplicationReceived::class);
        $this->assertTeamAlerted('Nouvelle candidature de stage', '/admin/stages/');
    }

    public function test_claim_alerts_the_team_only_once(): void
    {
        $user = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->create();
        $claim = ['message' => 'Je suis la directrice, joignable au 034 00 000 00.'];

        $this->actingAs($user)->postJson("/api/v1/establishments/{$establishment->slug}/claims", $claim)->assertCreated();
        $this->actingAs($user)->postJson("/api/v1/establishments/{$establishment->slug}/claims", $claim)->assertCreated();

        $this->assertTeamAlerted('Revendication de fiche', '/admin/claims/');
        Notification::assertSentTimes(TeamAlert::class, 1);
    }

    public function test_verification_request_alerts_the_team_only_for_a_new_request(): void
    {
        $this->seed(PlanSeeder::class);
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->draft()->create();
        $establishment->members()->attach($owner, ['role' => EstablishmentMemberRole::Owner->value]);

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/verification-request")->assertOk();
        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/verification-request")->assertOk();

        $this->assertTeamAlerted('Demande de vérification', '/admin/moderation/');
        Notification::assertSentTimes(TeamAlert::class, 1);
    }
}
