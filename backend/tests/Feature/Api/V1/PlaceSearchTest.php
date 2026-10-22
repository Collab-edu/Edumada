<?php

namespace Tests\Feature\Api\V1;

use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PlaceSearchTest extends TestCase
{
    use RefreshDatabase;

    private function photon(array $features): void
    {
        Http::fake(['photon.komoot.io/*' => Http::response(['features' => $features])]);
    }

    private function feature(string $name, string $key, string $value, array $extra, float $lat, float $lng): array
    {
        return [
            'geometry' => ['coordinates' => [$lng, $lat]],
            'properties' => ['name' => $name, 'osm_key' => $key, 'osm_value' => $value, 'countrycode' => 'MG', ...$extra],
        ];
    }

    public function test_it_lists_malagasy_places_with_their_district_and_region(): void
    {
        $this->photon([
            $this->feature('Talatamaty', 'place', 'suburb', ['county' => 'Ambohidratrimo', 'state' => 'Analamanga'], -18.8331, 47.4547),
            $this->feature('Analamanga', 'boundary', 'administrative', ['type' => 'state'], -18.9, 47.5),
            $this->feature('Arrêt Talatamaty', 'highway', 'bus_stop', ['state' => 'Analamanga'], -18.83, 47.45),
            $this->feature('Talata', 'place', 'village', ['county' => 'Ankazobe', 'state' => 'Analamanga', 'countrycode' => 'KM'], -18.3, 47.1),
        ]);

        $this->getJson('/api/v1/places?q=Talat')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Talatamaty')
            ->assertJsonPath('data.0.kind', 'Quartier')
            ->assertJsonPath('data.0.detail', 'Ambohidratrimo, Analamanga')
            ->assertJsonPath('data.0.lat', -18.8331)
            ->assertJsonPath('data.1.kind', 'Région');

        Http::assertSent(fn ($request) => str_contains($request->url(), 'osm_tag=place') && str_contains($request->url(), 'bbox='));
    }

    public function test_results_are_cached(): void
    {
        $this->photon([$this->feature('Mahitsy', 'place', 'town', ['county' => 'Ambohidratrimo', 'state' => 'Analamanga'], -18.75, 47.35)]);
        $this->getJson('/api/v1/places?q=Mahitsy')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/places?q=Mahitsy')->assertOk()->assertJsonCount(1, 'data');
        Http::assertSentCount(1);
        $this->getJson('/api/v1/places?q=a')->assertUnprocessable();
    }

    public function test_a_photon_failure_returns_an_empty_list_and_is_not_cached(): void
    {
        Http::fake(['photon.komoot.io/*' => Http::sequence()->push('erreur', 500)->push(['features' => []])]);

        $this->getJson('/api/v1/places?q=Ambalavao')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/places?q=Ambalavao')->assertOk();

        Http::assertSentCount(2);
    }

    public function test_the_chosen_place_position_is_used_without_geocoding(): void
    {
        Http::fake();
        $near = Offer::factory()->for(Establishment::factory()->state(['city' => 'Ambositra', 'latitude' => -20.53, 'longitude' => 47.24]))->create();
        Offer::factory()->for(Establishment::factory()->state(['city' => 'Antananarivo', 'latitude' => -18.8792, 'longitude' => 47.5079]))->create();

        // « Ivato » près d'Ambositra (et non l'aéroport d'Antananarivo).
        $this->getJson('/api/v1/offers?city=Ivato&near=-20.6,47.2')
            ->assertOk()
            ->assertJsonPath('near.place', 'Ivato')
            ->assertJsonPath('data.0.id', $near->slug);

        Http::assertNothingSent();
        $this->getJson('/api/v1/offers?city=Ivato&near=abc')->assertUnprocessable()->assertJsonValidationErrors('near');
    }
}
