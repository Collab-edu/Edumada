<?php

namespace Tests\Feature\Api\V1;

use App\Enums\EstablishmentStatus;
use App\Enums\PlanCode;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstablishmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    public function test_index_lists_only_published_establishments(): void
    {
        $published = Establishment::factory()->create();
        Establishment::factory()->draft()->create();

        $this->getJson('/api/v1/establishments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $published->slug);
    }

    public function test_draft_returns_404_to_guests_and_other_establishments(): void
    {
        $draft = Establishment::factory()->draft()->create();
        $otherOwner = User::factory()->create(['role' => UserRole::Establishment]);
        Establishment::factory()->ownedBy($otherOwner)->create();

        $this->getJson("/api/v1/establishments/{$draft->slug}")->assertNotFound();
        $this->actingAs($otherOwner)->getJson("/api/v1/establishments/{$draft->slug}")->assertNotFound();
    }

    public function test_draft_is_visible_to_its_owner(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $draft = Establishment::factory()->draft()->ownedBy($owner)->create();

        $this->withToken($owner->createToken('web')->plainTextToken)
            ->getJson("/api/v1/establishments/{$draft->slug}")
            ->assertOk()
            ->assertJsonPath('data.name', $draft->name);
    }

    public function test_establishment_account_creates_a_pending_establishment_it_owns(): void
    {
        $user = User::factory()->create(['role' => UserRole::Establishment]);
        $category = Category::factory()->create();
        $category->subCategories()->create(['label' => 'Crèche']);

        $response = $this->actingAs($user)->postJson('/api/v1/establishments', [
            'name' => 'Crèche Les Lémuriens',
            'type' => 'Privé',
            'category' => $category->slug,
            'subCategory' => 'Crèche',
            'city' => 'Antsirabe',
            'coordinates' => ['lat' => -19.86, 'lng' => 47.03],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.id', 'creche-les-lemuriens')
            ->assertJsonPath('data.type', 'Privé')
            ->assertJsonPath('data.subCategory', 'Crèche')
            ->assertJsonPath('data.status', 'pending_review')
            ->assertJsonPath('data.plan.code', 'free');
        $establishment = Establishment::firstWhere('slug', 'creche-les-lemuriens');
        $this->assertSame(EstablishmentStatus::PendingReview, $establishment->status);
        $this->assertTrue($user->ownsEstablishment($establishment));
    }

    public function test_student_cannot_create_an_establishment_403(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->postJson('/api/v1/establishments', [
            'name' => 'Faux établissement',
            'type' => 'Privé',
            'category' => Category::factory()->create()->slug,
            'city' => 'Antananarivo',
        ])->assertForbidden();
    }

    public function test_rejects_sub_category_from_another_category_with_422(): void
    {
        $user = User::factory()->create(['role' => UserRole::Establishment]);
        $category = Category::factory()->create();
        Category::factory()->create()->subCategories()->create(['label' => 'Lycée']);

        $this->actingAs($user)->postJson('/api/v1/establishments', [
            'name' => 'Institut Test',
            'type' => 'Public',
            'category' => $category->slug,
            'subCategory' => 'Lycée',
            'city' => 'Antananarivo',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['subCategory' => 'Cette sous-catégorie n\'existe pas dans la catégorie choisie.']);
    }

    public function test_free_fiche_hides_gallery_online_links_and_extra_infrastructures(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $establishment->update([
            'website' => 'https://exemple.mg',
            'social_links' => ['facebook' => 'https://facebook.com/exemple'],
            'photos' => ['https://exemple.mg/a.jpg'],
            'infrastructures' => ['Bibliothèque', 'Cantine', 'Salle informatique'],
            'phone' => '034 00 000 00',
        ]);

        $this->getJson("/api/v1/establishments/{$establishment->slug}")
            ->assertOk()
            ->assertJsonPath('data.website', '')
            ->assertJsonPath('data.photos', [])
            ->assertJsonPath('data.infrastructures', ['Bibliothèque', 'Cantine'])
            ->assertJsonPath('data.phone', '034 00 000 00');

        // L'établissement garde toutes ses données dans son espace.
        $this->actingAs($owner)->getJson("/api/v1/establishments/{$establishment->slug}/manage")
            ->assertOk()
            ->assertJsonPath('data.website', 'https://exemple.mg')
            ->assertJsonCount(3, 'data.infrastructures');

        $this->subscribe($establishment, PlanCode::Pro);
        $this->getJson("/api/v1/establishments/{$establishment->slug}")
            ->assertJsonPath('data.website', 'https://exemple.mg')
            ->assertJsonCount(1, 'data.photos')
            ->assertJsonCount(3, 'data.infrastructures');
    }

    public function test_logo_is_shown_on_the_fiche_and_on_its_offers(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        Offer::factory()->for($establishment)->create();

        $this->actingAs($owner)->patchJson("/api/v1/establishments/{$establishment->slug}", [
            'logo' => 'https://exemple.mg/logo.png',
        ])->assertOk()->assertJsonPath('data.logo', 'https://exemple.mg/logo.png');

        $this->getJson("/api/v1/establishments/{$establishment->slug}")->assertJsonPath('data.logo', 'https://exemple.mg/logo.png');
        $this->getJson('/api/v1/offers')->assertJsonPath('data.0.schoolLogo', 'https://exemple.mg/logo.png');
    }

    public function test_free_fiche_rejects_gallery_and_more_than_two_infrastructures(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();

        $this->actingAs($owner)->patchJson("/api/v1/establishments/{$establishment->slug}", [
            'photos' => ['https://exemple.mg/a.jpg'],
            'infrastructures' => ['Bibliothèque', 'Cantine', 'Salle informatique'],
        ])->assertUnprocessable()->assertJsonValidationErrors(['photos', 'infrastructures']);

        $this->actingAs($owner)->patchJson("/api/v1/establishments/{$establishment->slug}", [
            'infrastructures' => ['Bibliothèque', 'Cantine'],
        ])->assertOk();
    }

    public function test_owner_updates_fields_but_cannot_self_verify(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();

        $this->actingAs($owner)->patchJson("/api/v1/establishments/{$establishment->slug}", [
            'city' => 'Mahajanga',
            'verification' => 'verified',
            'accreditationVerified' => true,
        ])->assertOk()->assertJsonPath('data.city', 'Mahajanga');

        $establishment->refresh();
        $this->assertSame('Mahajanga', $establishment->city);
        $this->assertSame('Non vérifié', $establishment->verification_status->label());
        $this->assertFalse($establishment->accreditation_verified);
    }

    public function test_member_of_another_establishment_cannot_update_403(): void
    {
        $intruder = User::factory()->create(['role' => UserRole::Establishment]);
        Establishment::factory()->ownedBy($intruder)->create();
        $establishment = Establishment::factory()->create();

        $this->actingAs($intruder)
            ->patchJson("/api/v1/establishments/{$establishment->slug}", ['city' => 'Toliara'])
            ->assertForbidden();
    }

    public function test_me_establishments_lists_managed_establishments_with_draft_offers(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create();
        Offer::factory()->draft()->for($establishment)->create();
        Establishment::factory()->create();

        $this->actingAs($owner)->getJson('/api/v1/me/establishments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.memberRole', 'owner')
            ->assertJsonPath('data.0.offers.0.status', 'draft');
    }
}
