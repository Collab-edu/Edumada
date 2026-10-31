<?php

namespace App\Policies;

use App\Enums\OfferKind;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\User;

class OfferPolicy
{
    /**
     * Offre publiée d'un établissement publié : visible par tous. Sinon : équipe et administrateurs.
     */
    public function view(?User $user, Offer $offer): bool
    {
        if ($offer->isPubliclyVisible()) {
            return true;
        }

        return $user !== null && ($user->isAdmin() || $user->managesEstablishment($offer->establishment));
    }

    /**
     * L'équipe de l'établissement rédige ses offres ; l'administration Edumada publie seule les stages
     * (le type d'offre autorisé pour chacun est vérifié par OfferRequest).
     */
    public function create(User $user, Establishment $establishment): bool
    {
        return $user->isAdmin() || $user->managesEstablishment($establishment);
    }

    public function update(User $user, Offer $offer): bool
    {
        return $offer->kind === OfferKind::Internship
            ? $user->isAdmin()
            : $user->managesEstablishment($offer->establishment);
    }

    /**
     * Retrait d'une offre : son établissement, ou un administrateur (contenu abusif).
     */
    public function delete(User $user, Offer $offer): bool
    {
        return $user->isAdmin() || $this->update($user, $offer);
    }
}
