<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\Domain;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'contact' => 'stages@vanille.example',
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
        $internship = new Internship(['company_name' => 'Société Vanille', 'title' => 'Stage', 'city' => 'Antsirabe', 'modality' => 'Présentiel', 'registration' => 'Ouvertes', 'contact' => 'a@b.example', 'status' => 'published']);
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

    public function test_company_name_and_contact_are_required(): void
    {
        $this->actingAs($this->adminUser())
            ->postJson('/api/v1/admin/internships', $this->payload(['companyName' => '', 'contact' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['companyName', 'contact']);
    }
}
