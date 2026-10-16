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

    public function create(User $user, Establishment $establishment): bool
    {
        return $user->isAdmin() || $user->managesEstablishment($establishment);
    }

    public function update(User $user, Offer $offer): bool
    {
        return $user->isAdmin() || $user->managesEstablishment($offer->establishment);
    }

    public function delete(User $user, Offer $offer): bool
    {
        return $this->update($user, $offer);
    }
}
