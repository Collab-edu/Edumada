<?php

namespace Tests\Feature\Api\V1;

use App\Enums\AdmissionLevel;
use App\Enums\BillingCycle;
use App\Enums\EstablishmentSector;
use App\Enums\Modality;
use App\Enums\OfferStatus;
use App\Enums\PlanCode;
use App\Enums\SubscriptionStatus;
use App\Enums\UserRole;
use App\Models\Category;
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

    public function test_index_filters_by_category_or_sub_category(): void
    {
        $category = Category::factory()->create(['short_label' => 'Enseignement supérieur']);
        $university = $category->subCategories()->create(['label' => 'Université']);
        $school = $category->subCategories()->create(['label' => 'École supérieure']);
        $inUniversity = Offer::factory()->for(Establishment::factory()->state(['category_id' => $category->id, 'sub_category_id' => $university->id]))->create();
        $inSchool = Offer::factory()->for(Establishment::factory()->state(['category_id' => $category->id, 'sub_category_id' => $school->id]))->create();
        Offer::factory()->create();

        $this->getJson('/api/v1/offers?category=Université')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $inUniversity->slug);

        $this->getJson('/api/v1/offers?category=Enseignement supérieur')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/offers?category=École supérieure')->assertOk()->assertJsonPath('data.0.id', $inSchool->slug);
    }

    public function test_index_filters_semi_private_establishments(): void
    {
        $semiPrivate = Offer::factory()->for(Establishment::factory()->state(['sector' => EstablishmentSector::SemiPrivate]))->create();
        Offer::factory()->create();

        $this->getJson('/api/v1/offers?type=Semi-privé')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $semiPrivate->slug)
            ->assertJsonPath('data.0.schoolType', 'Semi-privé');
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

    public function test_offer_kind_must_match_the_establishment_category(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $category = Category::factory()->create(['slug' => 'superieur']);
        $establishment = Establishment::factory()->ownedBy($owner)->create(['category_id' => $category->id]);

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['kind' => 'accueil']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('kind');

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload())
            ->assertCreated();
    }

    public function test_offer_domain_must_match_the_establishment_category(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $category = Category::factory()->create(['slug' => 'formation-pro']);
        $establishment = Establishment::factory()->ownedBy($owner)->create(['category_id' => $category->id]);
        Domain::factory()->create(['name' => 'Médecine & Santé', 'categories' => ['superieur']]);
        Domain::factory()->create(['name' => 'Bâtiment & Travaux publics', 'categories' => ['formation-pro']]);

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['domain' => 'Médecine & Santé']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('domain');

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['domain' => 'Bâtiment & Travaux publics']))
            ->assertCreated();

        $this->getJson('/api/v1/domains?category=formation-pro')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Bâtiment & Travaux publics');
    }

    public function test_category_without_assigned_domains_sees_every_domain(): void
    {
        Domain::factory()->create(['categories' => ['superieur']]);
        Domain::factory()->create(['categories' => null]);

        $this->getJson('/api/v1/domains?category=autres')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_existing_offer_keeps_a_kind_outside_the_rule(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $category = Category::factory()->create(['slug' => 'superieur']);
        $establishment = Establishment::factory()->ownedBy($owner)->create(['category_id' => $category->id]);
        $offer = Offer::factory()->for($establishment)->create(['kind' => 'accueil']);

        $this->actingAs($owner)->patchJson("/api/v1/offers/{$offer->slug}", ['kind' => 'accueil', 'title' => 'Autre titre'])->assertOk();
    }

    public function test_old_link_still_finds_the_offer_and_returns_its_new_link(): void
    {
        $offer = Offer::factory()->create(['slug' => 'licence-informatique-institut-numerique', 'old_slug' => 'licence-informatique-inm']);

        $this->getJson('/api/v1/offers/licence-informatique-inm')
            ->assertOk()
            ->assertJsonPath('data.id', $offer->slug);
    }

    public function test_offer_is_found_by_establishment_and_url_slug(): void
    {
        $establishment = Establishment::factory()->create(['slug' => 'ispm']);
        $offer = Offer::factory()->for($establishment)->create(['title' => 'Licence informatique']);

        $this->assertSame('licence-informatique', $offer->url_slug);
        $this->getJson('/api/v1/establishments/ispm/offers/licence-informatique')
            ->assertOk()
            ->assertJsonPath('data.id', $offer->slug)
            ->assertJsonPath('data.urlSlug', 'licence-informatique');
    }

    public function test_url_slug_is_unique_only_within_an_establishment(): void
    {
        $establishment = Establishment::factory()->create();
        $offers = Offer::factory()->for($establishment)->count(2)->create(['title' => 'Licence informatique']);
        $other = Offer::factory()->create(['title' => 'Licence informatique']);

        $this->assertSame(['licence-informatique', 'licence-informatique-2'], $offers->pluck('url_slug')->all());
        $this->assertSame('licence-informatique', $other->url_slug);
    }

    public function test_owner_creates_an_offer_using_site_labels(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create(['name' => 'Institut Numérique de Madagascar', 'initials' => 'INM']);

        $response = $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('data.id', 'licence-en-informatique-institut-numerique-de-madagascar')
            ->assertJsonPath('data.modality', 'Présentiel')
            ->assertJsonPath('data.admission.selection', 'Sur dossier')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.details.costs.otherFees.0.amount', null);
        $offer = Offer::firstWhere('slug', 'licence-en-informatique-institut-numerique-de-madagascar');
        $this->assertSame(Modality::OnSite, $offer->modality);
        $this->assertSame(['C', 'D'], $offer->bac_series);
    }

    public function test_higher_education_offer_is_a_field_with_several_levels(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload([
                'title' => 'Génie logiciel',
                'diploma' => null,
                'durationYears' => null,
                'levels' => [
                    ['diploma' => 'Licence', 'durationYears' => 3, 'admissionLevel' => 'BAC'],
                    ['diploma' => 'Master', 'durationYears' => 2, 'admissionLevel' => 'BAC+3'],
                    ['diploma' => 'Autre', 'diplomaOther' => 'DTS', 'durationYears' => 2, 'admissionLevel' => 'BAC'],
                ],
            ]))
            ->assertCreated()
            ->assertJsonPath('data.levels.1.diploma', 'Master')
            ->assertJsonPath('data.levels.2.diplomaOther', 'DTS')
            // Résumé pour la recherche : premier niveau ; les frais restent ceux de l'offre.
            ->assertJsonPath('data.diploma', 'Licence')
            ->assertJsonPath('data.durationYears', 3)
            ->assertJsonPath('data.fees', 1800000)
            ->assertJsonPath('data.admission.level', 'BAC');

        Offer::query()->update(['status' => OfferStatus::Published]);
        $this->getJson('/api/v1/offers?diplomas[]=Master')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/offers?diplomas[]=Doctorat')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_vocational_offer_has_a_duration_in_a_unit_and_a_vocational_diploma(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload([
                'title' => 'Électricité bâtiment',
                'diploma' => 'Attestation',
                'durationYears' => null,
                'duration' => ['value' => 6, 'unit' => 'mois'],
            ]))
            ->assertCreated()
            ->assertJsonPath('data.diploma', 'Attestation')
            ->assertJsonPath('data.duration.unit', 'mois')
            ->assertJsonPath('data.durationYears', 0.5);
    }

    public function test_exam_fee_is_kept_only_for_a_competitive_exam(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        $url = "/api/v1/establishments/{$establishment->slug}/offers";
        $details = ['costs' => ['status' => 'Confirmés', 'examFee' => 25000]];

        $this->actingAs($owner)->postJson($url, $this->validPayload(['admission' => ['level' => 'BAC', 'selection' => 'Concours'], 'details' => $details]))
            ->assertCreated()->assertJsonPath('data.details.costs.examFee', 25000);
        $this->actingAs($owner)->postJson($url, $this->validPayload(['title' => 'Autre offre', 'details' => $details]))
            ->assertCreated()->assertJsonPath('data.details.costs.examFee', null);
    }

    public function test_other_diploma_must_be_specified(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        $url = "/api/v1/establishments/{$establishment->slug}/offers";

        $this->actingAs($owner)->postJson($url, $this->validPayload(['diploma' => 'Autre']))
            ->assertUnprocessable()->assertJsonValidationErrors('diplomaOther');
        $this->actingAs($owner)->postJson($url, $this->validPayload(['levels' => [['diploma' => 'Autre', 'durationYears' => 2, 'admissionLevel' => 'BAC']]]))
            ->assertUnprocessable()->assertJsonValidationErrors('levels.0.diplomaOther');
        $this->actingAs($owner)->postJson($url, $this->validPayload(['diploma' => 'Autre', 'diplomaOther' => 'Permis C']))
            ->assertCreated()->assertJsonPath('data.diplomaOther', 'Permis C');
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

    public function test_pro_plan_publishes_up_to_three_offers_and_premium_without_limit(): void
    {
        [$owner, $establishment] = $this->establishmentOwner(PlanCode::Pro);
        Offer::factory()->count(2)->for($establishment)->create();

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['status' => 'published']))
            ->assertCreated()
            ->assertJsonPath('data.status', 'published');

        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['title' => 'Master en droit', 'status' => 'published']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $establishment->subscriptions()->delete();
        $this->subscribe($establishment, PlanCode::Premium);
        $this->actingAs($owner)
            ->postJson("/api/v1/establishments/{$establishment->slug}/offers", $this->validPayload(['title' => 'Master en droit', 'status' => 'published']))
            ->assertCreated();
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
