<?php

namespace Tests\Feature\Api\V1;

use App\Enums\PlanCode;
use App\Models\Establishment;
use App\Models\Offer;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Formule Premium : en tête des résultats de recherche et badge doré sur les cartes.
 */
class PremiumPlanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    public function test_premium_offers_come_first_with_a_premium_flag(): void
    {
        $free = Offer::factory()->for(Establishment::factory()->state(['name' => 'Aaa Institut']))->create();
        [, $establishment] = $this->establishmentOwner(PlanCode::Premium);
        $premium = Offer::factory()->for($establishment)->create();

        $this->getJson('/api/v1/offers')
            ->assertOk()
            ->assertJsonPath('data.0.id', $premium->slug)
            ->assertJsonPath('data.0.premium', true)
            ->assertJsonPath('data.1.id', $free->slug)
            ->assertJsonPath('data.1.premium', false);

        // Les autres tris restent neutres.
        $this->getJson('/api/v1/offers?sort=frais-asc')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_premium_establishments_come_first_in_the_directory(): void
    {
        Establishment::factory()->create(['name' => 'Aaa Institut']);
        [, $premium] = $this->establishmentOwner(PlanCode::Premium);
        $premium->update(['name' => 'Zzz École']);
        [, $pro] = $this->establishmentOwner(PlanCode::Pro);
        $pro->update(['name' => 'Bbb Centre']);

        $this->getJson('/api/v1/establishments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $premium->slug)
            ->assertJsonPath('data.0.premium', true)
            ->assertJsonPath('data.1.name', 'Aaa Institut')
            ->assertJsonPath('data.2.premium', false);
    }
}
