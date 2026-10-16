<?php

namespace App\Policies;

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
     * Seule l'équipe de l'établissement rédige et publie ses offres (pas l'administration Edumada).
     */
    public function create(User $user, Establishment $establishment): bool
    {
        return $user->managesEstablishment($establishment);
    }

    public function update(User $user, Offer $offer): bool
    {
        return $user->managesEstablishment($offer->establishment);
    }

    /**
     * Retrait d'une offre : son établissement, ou un administrateur (contenu abusif).
     */
    public function delete(User $user, Offer $offer): bool
    {
        return $user->isAdmin() || $this->update($user, $offer);
    }
}
