<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;

/**
 * Avis vu par un administrateur : `TestimonialType` + statut de modération.
 *
 * @mixin Review
 */
class AdminReviewResource extends ReviewResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'schoolName' => $this->establishment->name,
            'formationTitle' => $this->offer?->title,
            'moderation' => $this->status->value,
            'moderationLabel' => $this->status->label(),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
