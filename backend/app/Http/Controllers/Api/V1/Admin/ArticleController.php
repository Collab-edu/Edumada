<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Rédaction des actualités : réservée à l'administrateur du site.
 */
class ArticleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        // Brouillons d'abord, puis les plus récents.
        return ArticleResource::collection(
            Article::query()->orderByRaw('published_at is not null')->latest('published_at')->latest('id')->paginate(20)
        );
    }

    public function store(Request $request): ArticleResource
    {
        $data = $this->validated($request);
        $article = Article::create([
            ...$data,
            'slug' => $this->uniqueSlug($data['title']),
            'author_id' => $request->user()->id,
        ]);
        AuditLog::record('article.created', $article);

        return new ArticleResource($article);
    }

    public function update(Request $request, Article $article): ArticleResource
    {
        $article->update($this->validated($request));
        AuditLog::record('article.updated', $article);

        return new ArticleResource($article);
    }

    public function destroy(Article $article): JsonResponse
    {
        AuditLog::record('article.deleted', $article, ['title' => $article->title]);
        $article->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'category' => ['required', Rule::in(array_keys(Article::CATEGORIES))],
            'excerpt' => ['required', 'string', 'max:300'],
            'content' => ['required', 'string', 'max:50000'],
            'coverImage' => ['nullable', 'string', 'max:500'],
            'published' => ['required', 'boolean'],
            'publishedAt' => ['nullable', 'date'],
        ]);

        return [
            'title' => $data['title'],
            'category' => $data['category'],
            'excerpt' => $data['excerpt'],
            'content' => $data['content'],
            'cover_image' => $data['coverImage'] ?? null,
            // Brouillon : pas de date. Publié : la date choisie, sinon maintenant.
            'published_at' => $data['published'] ? ($data['publishedAt'] ?? now()) : null,
        ];
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'article';
        $slug = $base;
        for ($i = 2; Article::where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
