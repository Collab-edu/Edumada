<?php

namespace Tests\Feature\Api\V1;

use App\Enums\PlanCode;
use App\Models\Campaign;
use App\Models\Offer;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Statistiques (Pro : standard, Premium : avancées) et campagnes sponsorisées (Premium).
 */
class StatsAndCampaignsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    public function test_tracked_views_appear_in_pro_statistics(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        $offer = Offer::factory()->for($establishment)->create();

        $this->postJson('/api/v1/track', ['events' => [
            ['type' => 'view', 'establishment' => $establishment->slug, 'offer' => $offer->slug],
            ['type' => 'view', 'establishment' => $establishment->slug, 'offer' => $offer->slug],
            ['type' => 'contact_click', 'establishment' => $establishment->slug, 'offer' => $offer->slug],
        ]])->assertNoContent();

        $this->actingAs($owner)->getJson("/api/v1/establishments/{$establishment->slug}/stats?days=7")
            ->assertOk()
            ->assertJsonPath('data.level', 'standard')
            ->assertJsonPath('data.totals.views', 2)
            ->assertJsonPath('data.totals.contactClicks', 1)
            ->assertJsonPath('data.offers.0.views', 2)
            ->assertJsonCount(7, 'data.series')
            ->assertJsonMissingPath('data.campaigns');
    }

    public function test_free_plan_has_no_statistics_403(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();

        $this->actingAs($owner)->getJson("/api/v1/establishments/{$establishment->slug}/stats")->assertForbidden();
    }

    public function test_pro_cannot_create_a_campaign_403(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        $offer = Offer::factory()->for($establishment)->create();

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/campaigns", [
            'offer' => $offer->slug, 'title' => 'Rentrée 2027', 'startsOn' => now()->toDateString(), 'endsOn' => now()->addMonth()->toDateString(),
        ])->assertForbidden();
    }

    public function test_premium_campaign_is_served_as_sponsored_and_measured(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Premium);
        $offer = Offer::factory()->for($establishment)->create();

        $campaignId = $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/campaigns", [
            'offer' => $offer->slug,
            'title' => 'Inscriptions ouvertes pour la rentrée',
            'startsOn' => now()->toDateString(),
            'endsOn' => now()->addMonth()->toDateString(),
            'targetCity' => 'Antananarivo',
        ])->assertCreated()->json('data.id');

        $this->getJson('/api/v1/sponsored?city=Antananarivo')
            ->assertOk()
            ->assertJsonPath('data.0.offer.id', $offer->slug)
            ->assertJsonPath('data.0.campaignId', $campaignId);
        $this->getJson('/api/v1/sponsored?city=Toliara')->assertOk()->assertJsonCount(0, 'data');

        $this->postJson('/api/v1/track', ['events' => [
            ['type' => 'impression', 'establishment' => $establishment->slug, 'offer' => $offer->slug, 'campaign' => $campaignId],
            ['type' => 'impression', 'establishment' => $establishment->slug, 'offer' => $offer->slug, 'campaign' => $campaignId],
            ['type' => 'click', 'establishment' => $establishment->slug, 'offer' => $offer->slug, 'campaign' => $campaignId],
        ]])->assertNoContent();

        $this->actingAs($owner)->getJson("/api/v1/establishments/{$establishment->slug}/stats")
            ->assertOk()
            ->assertJsonPath('data.level', 'advanced')
            ->assertJsonPath('data.campaigns.0.impressions', 2)
            ->assertJsonPath('data.campaigns.0.clickRate', 50);
    }

    public function test_campaign_stops_being_served_when_premium_ends(): void
    {
        [, $establishment] = $this->establishmentOwner();
        $offer = Offer::factory()->for($establishment)->create();
        $establishment->campaigns()->create([
            'offer_id' => $offer->id, 'title' => 'Ancienne campagne',
            'starts_on' => now()->subDay(), 'ends_on' => now()->addMonth(),
        ]);
        $this->assertSame(1, Campaign::count());

        $this->getJson('/api/v1/sponsored')->assertOk()->assertJsonCount(0, 'data');
    }
}
