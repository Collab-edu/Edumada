<?php

namespace Tests\Feature\Api\V1;

use App\Enums\PlanCode;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Établissements multi-cycles (crèche → université) : autres catégories sur la fiche, catégorie propre à chaque offre.
 */
class MultiCategoryEstablishmentTest extends TestCase
{
    use RefreshDatabase;

    private Category $higher;

    private Category $nursery;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
        $this->higher = Category::factory()->create(['slug' => 'superieur', 'short_label' => 'Enseignement supérieur']);
        $this->nursery = Category::factory()->create(['slug' => 'petite-enfance', 'short_label' => 'Crèche']);
    }

    /**
     * @return array<string, mixed>
     */
    private function careOffer(array $overrides = []): array
    {
        return [
            'title' => 'Crèche des tout-petits',
            'category' => 'petite-enfance',
            'kind' => 'accueil',
            'ageRange' => ['min' => 1, 'max' => 3],
            'modality' => 'Présentiel',
            'registration' => 'Ouvertes',
            'admission' => ['level' => 'Aucun', 'selection' => 'Sur dossier'],
            ...$overrides,
        ];
    }

    /**
     * @return array{0: User, 1: Establishment}
     */
    private function owner(PlanCode $plan): array
    {
        [$owner, $establishment] = $this->establishmentOwner($plan);
        $establishment->update(['category_id' => $this->higher->id]);

        return [$owner, $establishment];
    }

    public function test_free_plan_keeps_a_single_category(): void
    {
        [$owner, $establishment] = $this->owner(PlanCode::Free);

        $this->actingAs($owner)
            ->patchJson("/api/v1/establishments/{$establishment->slug}", ['secondaryCategories' => ['petite-enfance']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('secondaryCategories');

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->careOffer())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    }

    public function test_pro_establishment_publishes_offers_in_its_other_categories(): void
    {
        [$owner, $establishment] = $this->owner(PlanCode::Pro);

        $this->actingAs($owner)
            ->patchJson("/api/v1/establishments/{$establishment->slug}", ['secondaryCategories' => ['petite-enfance', 'superieur']])
            ->assertOk()
            ->assertJsonPath('data.category', 'superieur')
            ->assertJsonPath('data.secondaryCategories', ['petite-enfance']);

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->careOffer(['status' => 'published']))
            ->assertCreated()
            ->assertJsonPath('data.category', 'petite-enfance');

        // L'offre et la fiche ressortent dans la recherche de la catégorie secondaire.
        $this->getJson('/api/v1/offers?category=Crèche')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/offers?category=superieur')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/establishments?category=petite-enfance')
            ->assertOk()
            ->assertJsonPath('data.0.id', $establishment->slug);
    }

    public function test_offer_kind_is_checked_against_the_offer_category(): void
    {
        [$owner, $establishment] = $this->owner(PlanCode::Pro);
        $establishment->syncSecondaryCategories([$this->nursery->id]);

        // « Accueil » n'existe pas dans le supérieur, catégorie par défaut de l'offre.
        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->careOffer(['category' => null]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('kind');
    }

    public function test_removing_a_category_moves_its_offers_to_the_main_one(): void
    {
        [$owner, $establishment] = $this->owner(PlanCode::Pro);
        $establishment->syncSecondaryCategories([$this->nursery->id]);
        $offer = Offer::factory()->for($establishment)->create(['category_id' => $this->nursery->id]);

        $this->actingAs($owner)
            ->patchJson("/api/v1/establishments/{$establishment->slug}", ['secondaryCategories' => []])
            ->assertOk()
            ->assertJsonPath('data.secondaryCategories', []);

        $this->assertSame($this->higher->id, $offer->fresh()->category_id);
    }

    public function test_free_public_fiche_hides_other_categories_kept_after_a_downgrade(): void
    {
        [, $establishment] = $this->owner(PlanCode::Free);
        $establishment->secondaryCategories()->attach($this->nursery);

        $this->getJson("/api/v1/establishments/{$establishment->slug}")
            ->assertOk()
            ->assertJsonPath('data.secondaryCategories', []);
    }
}
