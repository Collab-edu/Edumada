<?php

namespace App\Http\Resources;

use App\Models\Offer;
use Illuminate\Http\Request;

/**
 * Tout ce qu'affiche la fiche offre (/formations/[id]) : `FormationType`, `details`
 * (`FormationDetailType`) et l'établissement (`SchoolType`).
 *
 * @mixin Offer
 */
class OfferPageResource extends OfferResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'details' => new OfferDetailResource($this->resource),
            'establishment' => new EstablishmentResource($this->establishment),
        ];
    }
}
