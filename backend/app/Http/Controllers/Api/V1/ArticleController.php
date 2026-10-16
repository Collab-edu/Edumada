<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Actualités publiées, consultables par tous.
 */
class ArticleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'category' => ['nullable', Rule::in(array_keys(Article::CATEGORIES))],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $articles = Article::published()
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12));

        return ArticleResource::collection($articles);
    }

    public function show(string $slug): ArticleResource
    {
        return new ArticleResource(Article::published()->where('slug', $slug)->firstOrFail());
    }
}
