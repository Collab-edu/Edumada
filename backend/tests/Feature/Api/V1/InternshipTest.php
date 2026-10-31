<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\Domain;
use App\Models\Internship;
use App\Models\InternshipApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InternshipTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'companyName' => 'Société Vanille',
            'companyLogo' => 'https://example.test/logo.png',
            'title' => 'Stage développeur web',
            'city' => 'Antananarivo',
            'durationMonths' => 6,
            'modality' => 'Présentiel',
            'registration' => 'Ouvertes',
            'missions' => "Développer le site\nTester les pages",
            'profile' => 'Étudiant en informatique',
            'benefits' => 'Encadrement par un développeur',
            'allowance' => '200 000 Ar par mois',
            ...$overrides,
        ];
    }

    private function adminUser(): User
    {
        return User::factory()->create(['role' => UserRole::Admin]);
    }

    public function test_admin_publishes_an_internship_visible_by_everyone(): void
    {
        $domain = Domain::factory()->create(['name' => 'Informatique']);

        $response = $this->actingAs($this->adminUser())
            ->postJson('/api/v1/admin/internships', $this->payload(['domain' => $domain->name, 'status' => 'published']));

        $response->assertCreated()
            ->assertJsonPath('data.id', 'stage-developpeur-web-societe-vanille')
            ->assertJsonPath('data.companyName', 'Société Vanille')
            ->assertJsonPath('data.domain', 'Informatique');

        auth()->forgetGuards();
        $this->getJson('/api/v1/internships')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/internships/stage-developpeur-web-societe-vanille')
            ->assertOk()
            ->assertJsonPath('data.companyLogo', 'https://example.test/logo.png');
    }

    public function test_draft_is_hidden_from_the_public_and_shown_to_the_admin(): void
    {
        $admin = $this->adminUser();
        $slug = $this->actingAs($admin)->postJson('/api/v1/admin/internships', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->json('data.id');

        $this->actingAs($admin)->getJson('/api/v1/admin/internships')->assertOk()->assertJsonCount(1, 'data');

        auth()->forgetGuards();
        $this->getJson('/api/v1/internships')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/internships/{$slug}")->assertNotFound();
    }

    public function test_only_the_admin_can_manage_internships(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $internship = new Internship(['company_name' => 'Société Vanille', 'title' => 'Stage', 'city' => 'Antsirabe', 'modality' => 'Présentiel', 'registration' => 'Ouvertes', 'status' => 'published']);
        $internship->slug = 'stage';
        $internship->save();

        $this->actingAs($owner)->postJson('/api/v1/admin/internships', $this->payload())->assertForbidden();
        $this->actingAs($owner)->patchJson('/api/v1/admin/internships/stage', ['title' => 'Autre'])->assertForbidden();
        $this->actingAs($owner)->deleteJson('/api/v1/admin/internships/stage')->assertForbidden();
    }

    public function test_admin_updates_and_deletes_an_internship(): void
    {
        $admin = $this->adminUser();
        $slug = $this->actingAs($admin)->postJson('/api/v1/admin/internships', $this->payload())->json('data.id');

        $this->actingAs($admin)->patchJson("/api/v1/admin/internships/{$slug}", ['status' => 'published', 'companyLogo' => null])
            ->assertOk()
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.companyLogo', null);

        $this->actingAs($admin)->deleteJson("/api/v1/admin/internships/{$slug}")->assertNoContent();
        $this->assertDatabaseCount('internships', 0);
    }

    private function publishedInternship(array $overrides = []): Internship
    {
        $internship = new Internship(['company_name' => 'Société Vanille', 'title' => 'Stage', 'city' => 'Antsirabe', 'modality' => 'Présentiel', 'registration' => 'Ouvertes', 'status' => 'published', ...$overrides]);
        $internship->slug = 'stage';
        $internship->save();

        return $internship;
    }

    /**
     * @return array<string, UploadedFile>
     */
    private function files(): array
    {
        return [
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'letter' => UploadedFile::fake()->create('lettre.pdf', 100, 'application/pdf'),
        ];
    }

    public function test_student_applies_once_and_admin_receives_the_documents(): void
    {
        Storage::fake('local');
        $this->publishedInternship();
        $student = User::factory()->create(['role' => UserRole::Student, 'name' => 'Fanja']);

        $id = $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', $this->files())
            ->assertCreated()
            ->assertJsonPath('data.status', 'new')
            ->json('data.id');

        $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', $this->files())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('internship');
        $this->actingAs($student)->getJson('/api/v1/me/internship-applications')->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($student)->getJson("/api/v1/admin/internship-applications/{$id}/cv")->assertForbidden();

        $admin = $this->adminUser();
        $this->actingAs($admin)->getJson('/api/v1/admin/internship-applications')
            ->assertOk()
            ->assertJsonPath('data.0.applicant.name', 'Fanja')
            ->assertJsonPath('data.0.cvName', 'cv.pdf');
        $this->actingAs($admin)->get("/api/v1/admin/internship-applications/{$id}/letter")->assertOk();
        $this->actingAs($admin)->putJson("/api/v1/admin/internship-applications/{$id}", ['status' => 'accepted'])->assertOk()->assertJsonPath('data.status', 'accepted');
    }

    public function test_guest_and_non_student_cannot_apply(): void
    {
        Storage::fake('local');
        $this->publishedInternship();

        $this->postJson('/api/v1/internships/stage/applications', $this->files())->assertUnauthorized();
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $this->actingAs($owner)->postJson('/api/v1/internships/stage/applications', $this->files())->assertForbidden();
    }

    public function test_cv_and_letter_are_required_and_must_be_documents(): void
    {
        Storage::fake('local');
        $this->publishedInternship();
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', [
            'cv' => UploadedFile::fake()->create('cv.exe', 10, 'application/octet-stream'),
        ])->assertUnprocessable()->assertJsonValidationErrors(['cv', 'letter']);
    }

    public function test_closed_or_past_deadline_internship_refuses_applications(): void
    {
        Storage::fake('local');
        $internship = $this->publishedInternship(['deadline' => now()->subDay()->toDateString()]);
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', $this->files())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('internship');

        $internship->update(['deadline' => now()->toDateString()]);
        $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', $this->files())->assertCreated();
    }

    public function test_deleting_an_internship_removes_application_documents(): void
    {
        Storage::fake('local');
        $internship = $this->publishedInternship();
        $student = User::factory()->create(['role' => UserRole::Student]);
        $path = $this->actingAs($student)->postJson('/api/v1/internships/stage/applications', $this->files())->assertCreated()->json('data.id');
        $application = InternshipApplication::findOrFail($path);
        Storage::disk('local')->assertExists($application->cv_path);

        $this->actingAs($this->adminUser())->deleteJson('/api/v1/admin/internships/stage')->assertNoContent();

        Storage::disk('local')->assertMissing($application->cv_path);
        $this->assertDatabaseCount('internship_applications', 0);
    }

    public function test_company_name_is_required(): void
    {
        $this->actingAs($this->adminUser())
            ->postJson('/api/v1/admin/internships', $this->payload(['companyName' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['companyName']);
    }
}
