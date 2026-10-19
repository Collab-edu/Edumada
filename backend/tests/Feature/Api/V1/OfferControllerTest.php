<?php

namespace Tests\Feature\Api\V1;

use App\Enums\AdmissionLevel;
use App\Enums\BillingCycle;
use App\Enums\Modality;
use App\Enums\OfferStatus;
use App\Enums\PlanCode;
use App\Enums\SubscriptionStatus;
use App\Enums\UserRole;
use App\Models\Domain;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\Plan;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OfferControllerTest extends TestCase
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
    private function validPayload(array $overrides = []): array
    {
        return [
            'title' => 'Licence en informatique',
            'kind' => 'formation',
            'diploma' => 'Licence',
            'durationYears' => 3,
            'fees' => 1800000,
            'feesPeriod' => 'an',
            'modality' => 'Présentiel',
            'registration' => 'Ouvertes',
            'admission' => ['level' => 'BAC', 'bacSeries' => ['C', 'D'], 'selection' => 'Sur dossier'],
            'details' => [
                'objectives' => ['Maîtriser la programmation'],
                'costs' => ['status' => 'Confirmés', 'otherFees' => [['label' => 'Assurance', 'amount' => null]]],
            ],
            ...$overrides,
        ];
    }

    public function test_index_excludes_drafts_and_offers_of_unpublished_establishments(): void
    {
        $visible = Offer::factory()->create();
        Offer::factory()->draft()->create();
        Offer::factory()->for(Establishment::factory()->draft())->create();

        $this->getJson('/api/v1/offers')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->slug);
    }

    public function test_index_filters_by_modality_and_student_level(): void
    {
        $match = Offer::factory()->create(['modality' => Modality::Remote, 'admission_level' => AdmissionLevel::Bac]);
        Offer::factory()->create(['modality' => Modality::OnSite, 'admission_level' => AdmissionLevel::Bac]);
        Offer::factory()->create(['modality' => Modality::Remote, 'admission_level' => AdmissionLevel::BacPlus3]);

        $this->getJson('/api/v1/offers?modalities[]=Distanciel&level=BAC')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $match->slug);
    }

    public function test_index_filters_by_child_age_and_domain(): void
    {
        $domain = Domain::factory()->create(['name' => 'Petite enfance']);
        $match = Offer::factory()->for($domain)->create(['age_min' => 0.25, 'age_max' => 3]);
        Offer::factory()->for($domain)->create(['age_min' => 3, 'age_max' => 6]);
        Offer::factory()->create(['age_min' => 0, 'age_max' => 3]);

        $this->getJson('/api/v1/offers?childAge=1&domain=Petite%20enfance')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $match->slug);
    }

    public function test_index_combines_fee_ranges_durations_and_other_languages_like_the_site(): void
    {
        $cheapShort = Offer::factory()->create(['fees' => 800000, 'duration_years' => 0.5, 'languages' => ['Français', 'Chinois']]);
        $expensiveLong = Offer::factory()->create(['fees' => 6000000, 'duration_years' => 5, 'languages' => ['Anglais']]);
        Offer::factory()->create(['fees' => 3000000, 'duration_years' => 3, 'languages' => ['Français']]);

        $this->getJson('/api/v1/offers?feeRanges[]=0-1000000&feeRanges[]=5000000-')
            ->assertOk()
            ->assertJsonPath('data.*.id', [$cheapShort->slug, $expensiveLong->slug]);
        $this->getJson("/api/v1/offers?durations[]=Moins%20d'un%20an&durations[]=5%20ans%20ou%20plus")
            ->assertOk()
            ->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/offers?languages[]=Autre')
            ->assertOk()
            ->assertJsonPath('data.*.id', [$cheapShort->slug]);
    }

    public function test_fee_sort_puts_offers_without_fees_last(): void
    {
        $unknown = Offer::factory()->create(['fees' => null]);
        $expensive = Offer::factory()->create(['fees' => 3000000]);
        $cheap = Offer::factory()->create(['fees' => 500000]);

        $this->getJson('/api/v1/offers?sort=frais-asc')
            ->assertOk()
            ->assertJsonPath('data.*.id', [$cheap->slug, $expensive->slug, $unknown->slug]);
    }

    public function test_draft_offer_returns_404_to_guests(): void
    {
        $draft = Offer::factory()->draft()->create();

        $this->getJson("/api/v1/offers/{$draft->slug}")->assertNotFound();
    }

    public function test_owner_creates_an_offer_using_site_labels(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create(['initials' => 'INM']);

        $response = $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('data.id', 'licence-en-informatique-inm')
            ->assertJsonPath('data.modality', 'Présentiel')
            ->assertJsonPath('data.admission.selection', 'Sur dossier')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.details.costs.otherFees.0.amount', null);
        $offer = Offer::firstWhere('slug', 'licence-en-informatique-inm');
        $this->assertSame(Modality::OnSite, $offer->modality);
        $this->assertSame(['C', 'D'], $offer->bac_series);
    }

    public function test_free_plan_rejects_publishing_a_second_offer_with_422(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        Offer::factory()->for($establishment)->create();

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['status' => 'published']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => 'La formule Gratuit permet 1 offre publiée. Archivez une offre ou passez à une formule supérieure pour en publier davantage.']);

        $this->assertSame(1, $establishment->offers()->count());
    }

    public function test_free_plan_still_allows_saving_a_second_offer_as_draft(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        Offer::factory()->for($establishment)->create();

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload())
            ->assertCreated();
    }

    public function test_pro_plan_publishes_beyond_the_free_limit(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        Offer::factory()->count(3)->for($establishment)->create();
        $establishment->subscriptions()->create([
            'plan_id' => Plan::firstWhere('code', PlanCode::Pro)->id,
            'status' => SubscriptionStatus::Active,
            'billing_cycle' => BillingCycle::Yearly,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addYear(),
        ]);

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['status' => 'published']))
            ->assertCreated()
            ->assertJsonPath('data.status', 'published');
    }

    public function test_expired_subscription_falls_back_to_free_limit(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        Offer::factory()->count(3)->for($establishment)->create();
        $establishment->subscriptions()->create([
            'plan_id' => Plan::firstWhere('code', PlanCode::Pro)->id,
            'status' => SubscriptionStatus::Active,
            'billing_cycle' => BillingCycle::Monthly,
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subMonth(),
        ]);

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['status' => 'published']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_member_of_another_establishment_cannot_update_offer_403(): void
    {
        $intruder = User::factory()->create(['role' => UserRole::Establishment]);
        Establishment::factory()->ownedBy($intruder)->create();
        $offer = Offer::factory()->create();

        $this->actingAs($intruder)
            ->patchJson("/api/v1/offers/{$offer->slug}", ['title' => 'Piratée'])
            ->assertForbidden();

        $this->assertNotSame('Piratée', $offer->refresh()->title);
    }

    public function test_owner_archives_an_offer(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $offer = Offer::factory()->for(Establishment::factory()->ownedBy($owner))->create();

        $this->actingAs($owner)
            ->patchJson("/api/v1/offers/{$offer->slug}", ['status' => 'archived'])
            ->assertOk();

        $this->assertSame(OfferStatus::Archived, $offer->refresh()->status);
    }

    public function test_returns_401_when_creating_without_token(): void
    {
        $establishment = Establishment::factory()->create();

        $this->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload())
            ->assertUnauthorized();
    }
}
