<?php

namespace App\Http\Resources;

use App\Models\Offer;
use Illuminate\Http\Request;

/**
 * Offre vue par l'équipe de l'établissement : `FormationType` + statut de publication et détails.
 *
 * @mixin Offer
 */
class ManagedOfferResource extends OfferResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'details' => new OfferDetailResource($this->resource),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
