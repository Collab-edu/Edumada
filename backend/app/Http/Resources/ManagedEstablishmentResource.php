<?php

namespace App\Http\Resources;

use App\Models\Establishment;
use Illuminate\Http\Request;

/**
 * Établissement vu par son équipe ou un administrateur : toutes les offres (brouillons compris),
 * statut de publication, formule en vigueur et rôle de l'utilisateur.
 *
 * @mixin Establishment
 */
class ManagedEstablishmentResource extends EstablishmentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $plan = $this->currentPlan();

        return [
            ...parent::toArray($request),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'memberRole' => $this->whenPivotLoaded('establishment_user', fn () => $this->pivot->role),
            'plan' => new PlanResource($plan),
            'publishedOffersCount' => $this->publishedOffers()->count(),
            'offers' => ManagedOfferResource::collection($this->whenLoaded('offers')),
        ];
    }
}
