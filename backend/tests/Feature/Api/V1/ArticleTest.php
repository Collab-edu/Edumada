<?php

namespace Tests\Feature\Api\V1;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Actualités : lecture publique, rédaction réservée à l'administrateur.
 */
class ArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_list_shows_only_published_articles_without_content(): void
    {
        $published = Article::factory()->create();
        Article::factory()->draft()->create();
        Article::factory()->create(['published_at' => now()->addWeek()]);

        $this->getJson('/api/v1/articles')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $published->slug)
            ->assertJsonMissingPath('data.0.content');
    }

    public function test_public_page_shows_a_published_article_and_hides_drafts(): void
    {
        $published = Article::factory()->create();
        $draft = Article::factory()->draft()->create();

        $this->getJson("/api/v1/articles/{$published->slug}")->assertOk()->assertJsonPath('data.content', $published->content);
        $this->getJson("/api/v1/articles/{$draft->slug}")->assertNotFound();
    }

    public function test_admin_creates_updates_and_deletes_an_article(): void
    {
        $admin = $this->admin();

        $slug = $this->actingAs($admin)->postJson('/api/v1/admin/articles', [
            'title' => 'Rentrée universitaire 2027',
            'category' => 'actualite',
            'excerpt' => 'Les dates clés de la rentrée.',
            'content' => 'Les inscriptions ouvrent en septembre.',
            'published' => false,
        ])->assertCreated()->assertJsonPath('data.published', false)->json('data.id');

        $this->assertSame('rentree-universitaire-2027', $slug);

        $this->actingAs($admin)->putJson("/api/v1/admin/articles/{$slug}", [
            'title' => 'Rentrée universitaire 2027',
            'category' => 'orientation',
            'excerpt' => 'Les dates clés de la rentrée.',
            'content' => 'Les inscriptions ouvrent en septembre.',
            'published' => true,
        ])->assertOk()->assertJsonPath('data.published', true)->assertJsonPath('data.categoryLabel', 'Orientation');

        $this->getJson("/api/v1/articles/{$slug}")->assertOk();

        $this->actingAs($admin)->deleteJson("/api/v1/admin/articles/{$slug}")->assertNoContent();
        $this->assertDatabaseMissing('articles', ['slug' => $slug]);
    }

    public function test_only_the_admin_can_write_articles(): void
    {
        $article = Article::factory()->create();
        $payload = ['title' => 'Test', 'category' => 'actualite', 'excerpt' => 'Résumé', 'content' => 'Contenu', 'published' => true];

        $this->postJson('/api/v1/admin/articles', $payload)->assertUnauthorized();
        $this->actingAs($this->student())->postJson('/api/v1/admin/articles', $payload)->assertForbidden();
        [$owner] = $this->establishmentOwner();
        $this->actingAs($owner)->putJson("/api/v1/admin/articles/{$article->slug}", $payload)->assertForbidden();
        $this->actingAs($owner)->deleteJson("/api/v1/admin/articles/{$article->slug}")->assertForbidden();
    }
}
