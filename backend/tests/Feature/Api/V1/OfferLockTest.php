<?php

namespace Tests\Feature\Api\V1;

use App\Enums\OfferStatus;
use App\Enums\PlanCode;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Formule Gratuit : l'offre publiée est verrouillée un an, pour qu'un établissement ne fasse pas tourner
 * son unique offre chaque mois. Le contenu (description, frais…) reste modifiable.
 */
class OfferLockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'title' => 'Licence en informatique',
            'kind' => 'formation',
            'diploma' => 'Licence',
            'durationYears' => 3,
            'modality' => 'Présentiel',
            'registration' => 'Ouvertes',
            'admission' => ['level' => 'BAC', 'selection' => 'Sur dossier'],
            ...$overrides,
        ];
    }

    /**
     * L'établissement publie sa première offre : le verrou démarre.
     *
     * @return array{0: User, 1: Establishment, 2: Offer}
     */
    private function publishedFreeOffer(): array
    {
        [$owner, $establishment] = $this->establishmentOwner();

        $slug = $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->payload(['status' => 'published']))
            ->assertCreated()
            ->json('data.id');

        return [$owner, $establishment->fresh(), Offer::where('slug', $slug)->firstOrFail()];
    }

    public function test_first_publication_locks_the_offer_for_a_year(): void
    {
        [$owner, $establishment, $offer] = $this->publishedFreeOffer();

        $this->assertSame($offer->id, $establishment->locked_offer_id);
        $this->assertTrue($establishment->offer_locked_until->isSameDay(now()->addYear()));

        $this->actingAs($owner)
            ->getJson('/api/v1/me/establishments')
            ->assertOk()
            ->assertJsonPath('data.0.offerLock.offerId', $offer->slug)
            ->assertJsonPath('data.0.offerLock.until', now()->addYear()->toDateString());
    }

    public function test_content_stays_editable_but_identity_is_locked_after_the_correction_delay(): void
    {
        [$owner, , $offer] = $this->publishedFreeOffer();

        // Délai de correction : une faute dans le titre se corrige encore.
        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['title' => 'Licence en informatique de gestion'])->assertOk();

        $this->travel(Establishment::OFFER_CORRECTION_DAYS + 1)->days();

        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['fees' => 2000000, 'details' => ['description' => 'Nouvelle présentation']])->assertOk();
        $this->actingAs($owner)
            ->patchJson("/api/v1/offers/{$offer->slug}", ['title' => 'Master en droit'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_archiving_does_not_free_the_slot_for_another_offer(): void
    {
        [$owner, $establishment, $offer] = $this->publishedFreeOffer();
        $this->travel(Establishment::OFFER_CORRECTION_DAYS + 1)->days();

        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['status' => 'archived'])->assertOk();

        // Renommer l'offre archivée pour la republier ne contourne pas le verrou.
        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['title' => 'Master en droit'])->assertUnprocessable();

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->payload(['title' => 'Master en droit', 'status' => 'published']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        // La même offre peut revenir en ligne.
        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['status' => 'published'])->assertOk();
    }

    public function test_another_offer_can_be_published_once_the_year_is_over(): void
    {
        [$owner, $establishment, $offer] = $this->publishedFreeOffer();
        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['status' => 'archived'])->assertOk();

        $this->travel(1)->years();
        $this->travel(1)->days();

        $slug = $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->payload(['title' => 'Master en droit', 'status' => 'published']))
            ->assertCreated()
            ->json('data.id');

        $this->assertSame(Offer::where('slug', $slug)->value('id'), $establishment->fresh()->locked_offer_id);
    }

    public function test_paid_plans_are_not_locked(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        $offer = Offer::factory()->for($establishment)->create(['status' => OfferStatus::Published]);

        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['title' => 'Master en droit'])->assertOk();
        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->payload(['status' => 'published']))
            ->assertCreated();

        $this->assertNull($establishment->fresh()->offer_locked_until);
    }
}
