<?php

namespace Tests\Feature\Api\V1;

use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NearbyOfferSearchTest extends TestCase
{
    use RefreshDatabase;

    /** Talatamaty, au nord-ouest d'Antananarivo. */
    private function fakeTalatamaty(): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                ['lat' => '-18.8331', 'lon' => '47.4547', 'display_name' => 'Talatamaty, Ambohidratrimo, Analamanga, Madagascar'],
            ]),
        ]);
    }

    private function offerIn(string $city, ?float $lat, ?float $lng): Offer
    {
        return Offer::factory()->for(Establishment::factory()->state(['city' => $city, 'latitude' => $lat, 'longitude' => $lng]))->create();
    }

    public function test_a_place_without_offers_returns_the_nearest_ones_first(): void
    {
        $this->fakeTalatamaty();
        $far = $this->offerIn('Antsirabe', -19.8659, 47.0333);
        $near = $this->offerIn('Antananarivo', -18.8792, 47.5079);
        $this->offerIn('Toamasina', null, null);

        $response = $this->getJson('/api/v1/offers?city=Talatamaty')->assertOk();

        $response->assertJsonPath('near.place', 'Talatamaty')
            ->assertJsonPath('data.0.id', $near->slug)
            ->assertJsonPath('data.1.id', $far->slug)
            ->assertJsonCount(2, 'data');
        $this->assertEqualsWithDelta(7.5, $response->json('data.0.distanceKm'), 1.5);
        $this->assertGreaterThan(100, $response->json('data.1.distanceKm'));
    }

    public function test_a_city_with_offers_keeps_the_exact_filter(): void
    {
        Http::fake();
        $match = $this->offerIn('Antananarivo', -18.8792, 47.5079);
        $this->offerIn('Antsirabe', -19.8659, 47.0333);

        $this->getJson('/api/v1/offers?city=Antananarivo')
            ->assertOk()
            ->assertJsonMissingPath('near')
            ->assertJsonPath('data.0.id', $match->slug)
            ->assertJsonCount(1, 'data')
            ->assertJsonMissingPath('data.0.distanceKm');

        Http::assertNothingSent();
    }

    public function test_other_filters_still_apply_around_the_place(): void
    {
        $this->fakeTalatamaty();
        $this->offerIn('Antananarivo', -18.8792, 47.5079)->update(['fees' => 5000000]);
        $cheap = $this->offerIn('Antsirabe', -19.8659, 47.0333);

        $this->getJson('/api/v1/offers?city=Talatamaty&feeRanges[]=0-2000000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $cheap->slug);
    }

    public function test_an_unknown_place_says_so_and_is_looked_up_once(): void
    {
        Http::fake(['nominatim.openstreetmap.org/*' => Http::response([])]);
        $this->offerIn('Antananarivo', -18.8792, 47.5079);

        $this->getJson('/api/v1/offers?city=Xyzabc')->assertOk()->assertJsonPath('placeNotFound', true)->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/offers?city=Xyzabc')->assertOk();

        Http::assertSentCount(1);
    }
}
