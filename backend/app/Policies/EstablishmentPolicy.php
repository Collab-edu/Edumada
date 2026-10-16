<?php

namespace App\Policies;

use App\Enums\EstablishmentStatus;
use App\Models\Establishment;
use App\Models\User;

/**
 * Un établissement ne voit et ne modifie que ses propres fiches ; seul un administrateur
 * publie, suspend ou vérifie une fiche.
 */
class EstablishmentPolicy
{
    /**
     * Fiche publiée : visible par tous. Brouillon : visible par son équipe et les administrateurs.
     */
    public function view(?User $user, Establishment $establishment): bool
    {
        if ($establishment->status === EstablishmentStatus::Published) {
            return true;
        }

        return $user !== null && ($user->isAdmin() || $user->managesEstablishment($establishment));
    }

    /**
     * Un compte établissement crée ou revendique sa fiche, qui part en validation.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isEstablishmentAccount();
    }

    public function update(User $user, Establishment $establishment): bool
    {
        return $user->isAdmin() || $user->managesEstablishment($establishment);
    }

    public function delete(User $user, Establishment $establishment): bool
    {
        return $user->isAdmin() || $user->ownsEstablishment($establishment);
    }

    /**
     * Publication, suspension, badge « vérifié » et accréditation vérifiée.
     */
    public function moderate(User $user, Establishment $establishment): bool
    {
        return $user->isAdmin();
    }
}
