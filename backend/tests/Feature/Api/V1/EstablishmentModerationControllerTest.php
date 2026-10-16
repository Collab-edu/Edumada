<?php

namespace Tests\Feature\Api\V1;

use App\Enums\EstablishmentStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Establishment;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstablishmentModerationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    public function test_admin_publishes_and_verifies_an_establishment(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $establishment = Establishment::factory()->draft()->create();

        $this->actingAs($admin)->putJson("/api/v1/establishments/{$establishment->slug}/moderation", [
            'status' => 'published',
            'verification' => 'verified',
            'accreditationVerified' => true,
        ])->assertOk()
            ->assertJsonPath('data.verification.status', 'Vérifié')
            ->assertJsonPath('data.accreditationVerified', true);

        $establishment->refresh();
        $this->assertSame(EstablishmentStatus::Published, $establishment->status);
        $this->assertSame(VerificationStatus::Verified, $establishment->verification_status);
        $this->assertNotNull($establishment->verified_at);
    }

    public function test_owner_cannot_moderate_own_establishment_403(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->draft()->ownedBy($owner)->create();

        $this->actingAs($owner)
            ->putJson("/api/v1/establishments/{$establishment->slug}/moderation", ['status' => 'published'])
            ->assertForbidden();

        $this->assertSame(EstablishmentStatus::PendingReview, $establishment->refresh()->status);
    }
}
