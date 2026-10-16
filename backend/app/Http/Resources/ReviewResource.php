<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Format `TestimonialType` du site. Nécessite `establishment` et `offer` chargés.
 *
 * @mixin Review
 */
class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'schoolId' => $this->establishment->slug,
            'formationId' => $this->offer?->slug ?? '',
            'name' => $this->author_name,
            'status' => $this->author_status ?? '',
            'rating' => $this->rating,
            'quote' => $this->quote,
        ];
    }
}
