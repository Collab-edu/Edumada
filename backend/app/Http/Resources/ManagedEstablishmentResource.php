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
     * Relations à charger avant de construire la ressource (évite les requêtes N+1).
     *
     * @var list<string>
     */
    public const RELATIONS = ['category', 'subCategory', 'publishedOffers.domain', 'offers.domain', 'offers.establishment.category'];

    /**
     * L'établissement voit toutes ses données, même celles que sa formule n'affiche pas.
     */
    protected function appliesPlanLimits(): bool
    {
        return false;
    }

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
            'members' => $this->whenLoaded('members', fn () => $this->members->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->pivot->role,
            ])),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
