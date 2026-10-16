<?php

namespace App\Http\Resources;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Article
 */
class ArticleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'title' => $this->title,
            'category' => $this->category,
            'categoryLabel' => Article::CATEGORIES[$this->category] ?? $this->category,
            'excerpt' => $this->excerpt,
            // La liste publique n'a besoin que du résumé.
            'content' => $this->when(! $request->routeIs('api.v1.articles.index'), $this->content),
            'coverImage' => $this->cover_image,
            'publishedAt' => $this->published_at?->toIso8601String(),
            'published' => $this->isPublished(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
