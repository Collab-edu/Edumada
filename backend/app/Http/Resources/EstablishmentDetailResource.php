<?php

namespace App\Http\Resources;

use App\Models\Establishment;
use Illuminate\Http\Request;

/**
 * Fiche établissement complète : `SchoolType` + catégorie, offres publiées et avis.
 *
 * @mixin Establishment
 */
class EstablishmentDetailResource extends EstablishmentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'categoryDetails' => new CategoryResource($this->category),
            'offers' => OfferResource::collection($this->whenLoaded('publishedOffers')),
            'testimonials' => ReviewResource::collection($this->whenLoaded('publishedReviews')),
        ];
    }
}
