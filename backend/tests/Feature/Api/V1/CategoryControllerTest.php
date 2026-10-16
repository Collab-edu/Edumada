<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creates_a_category_with_sub_categories(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)->postJson('/api/v1/categories', [
            'label' => 'Crèche et petite enfance',
            'shortLabel' => 'Petite enfance',
            'icon' => 'tabler:baby-carriage',
            'offersLabel' => 'Accueil proposé',
            'fields' => ['diplomas' => false, 'childAge' => true],
            'subCategories' => ['Crèche', 'Garderie'],
        ])->assertCreated()
            ->assertJsonPath('data.id', 'petite-enfance')
            ->assertJsonPath('data.subCategories', ['Crèche', 'Garderie'])
            ->assertJsonPath('data.fields.diplomas', false)
            ->assertJsonPath('data.fields.programme', true);
    }

    public function test_update_removes_sub_categories_missing_from_the_list(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $category = Category::factory()->create();
        $category->subCategories()->createMany([['label' => 'Collège'], ['label' => 'Lycée']]);

        $this->actingAs($admin)
            ->patchJson("/api/v1/categories/{$category->slug}", ['subCategories' => ['Lycée', 'École primaire']])
            ->assertOk()
            ->assertJsonPath('data.subCategories', ['Lycée', 'École primaire']);
    }

    public function test_establishment_account_cannot_create_a_category_403(): void
    {
        $user = User::factory()->create(['role' => UserRole::Establishment]);

        $this->actingAs($user)->postJson('/api/v1/categories', [
            'label' => 'Catégorie', 'shortLabel' => 'Cat', 'icon' => 'tabler:x', 'offersLabel' => 'Offres',
        ])->assertForbidden();
    }

    public function test_category_with_establishments_cannot_be_deleted_422(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $establishment = Establishment::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/v1/categories/{$establishment->category->slug}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    }
}
