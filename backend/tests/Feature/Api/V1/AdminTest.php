<?php

namespace Tests\Feature\Api\V1;

use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\Plan;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    public function test_admin_area_returns_403_to_other_accounts(): void
    {
        [$owner] = $this->establishmentOwner();

        $this->actingAs($owner)->getJson('/api/v1/admin/overview')->assertForbidden();
        $this->actingAs($this->student())->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_overview_counts_the_moderation_queues(): void
    {
        Establishment::factory()->draft()->create();

        $this->actingAs($this->admin())->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.queues.establishmentsPending', 1);
    }

    public function test_approved_claim_gives_the_establishment_to_the_requester(): void
    {
        $user = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->create();

        $this->actingAs($user)->postJson("/api/v1/establishments/{$establishment->slug}/claims", [
            'message' => 'Je suis la directrice, joignable au 034 00 000 00.',
        ])->assertCreated();
        $claimId = $establishment->claims()->value('id');

        $this->actingAs($this->admin())->putJson("/api/v1/admin/claims/{$claimId}", ['status' => 'approved'])->assertOk();

        $this->assertTrue($user->ownsEstablishment($establishment));
        $this->assertDatabaseHas('audit_logs', ['action' => 'establishment.claim_approved']);
    }

    public function test_published_review_appears_on_the_site(): void
    {
        $offer = Offer::factory()->create();
        $review = $offer->establishment->reviews()->create([
            'offer_id' => $offer->id, 'author_name' => 'Hery R.', 'rating' => 5, 'quote' => 'Une formation très concrète.',
        ]);

        $this->actingAs($this->admin())->putJson("/api/v1/admin/reviews/{$review->id}", ['status' => 'published'])->assertOk();

        $this->assertSame(ReviewStatus::Published, $review->refresh()->status);
        $this->getJson('/api/v1/reviews')->assertOk()->assertJsonPath('data.0.name', 'Hery R.');
    }

    public function test_admin_adjusts_plan_prices_and_the_change_is_audited(): void
    {
        $this->actingAs($this->admin())->patchJson('/api/v1/admin/plans/pro', ['monthlyPrice' => 90000])
            ->assertOk()
            ->assertJsonPath('data.monthlyPrice', 90000);

        $this->assertSame(90000, Plan::firstWhere('code', 'pro')->monthly_price);
        $this->assertDatabaseHas('audit_logs', ['action' => 'plan.updated']);
    }

    public function test_manage_endpoint_opens_any_fiche_to_admins_but_not_to_other_establishments(): void
    {
        $draft = Establishment::factory()->draft()->create();
        [$intruder] = $this->establishmentOwner();

        $this->actingAs($this->admin())->getJson("/api/v1/establishments/{$draft->slug}/manage")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_review');
        $this->actingAs($intruder)->getJson("/api/v1/establishments/{$draft->slug}/manage")->assertForbidden();
    }

    public function test_admin_cannot_change_own_role_422(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => 'student'])->assertUnprocessable();
    }
}
