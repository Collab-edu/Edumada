<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResetDataCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_erases_test_content_and_keeps_admins_and_reference_data(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('uploads/2026/11/logo.png', UploadedFile::fake()->image('logo.png')->getContent());

        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $student = User::factory()->create(['role' => UserRole::Student]);
        $offer = Offer::factory()->create();
        $offer->establishment->members()->attach($owner, ['role' => 'owner']);
        $student->favoriteOffers()->attach($offer);
        Article::factory()->create();
        $student->createToken('web');
        $admin->createToken('web');
        $categories = Category::count();

        $this->artisan('edumada:reset-data', ['--force' => true])->assertSuccessful();

        $this->assertDatabaseCount('establishments', 0);
        $this->assertDatabaseCount('offers', 0);
        $this->assertDatabaseCount('favorites', 0);
        $this->assertDatabaseCount('articles', 0);
        $this->assertSame([$admin->id], User::pluck('id')->all());
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertSame($categories, Category::count());
        Storage::disk('public')->assertMissing('uploads/2026/11/logo.png');
    }

    public function test_nothing_is_erased_without_confirmation(): void
    {
        Offer::factory()->create();

        $this->artisan('edumada:reset-data')
            ->expectsQuestion('Tapez EFFACER pour confirmer', 'non')
            ->assertSuccessful();

        $this->assertDatabaseCount('offers', 1);
    }
}
