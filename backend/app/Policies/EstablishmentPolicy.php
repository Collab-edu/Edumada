<?php

namespace App\Policies;

use App\Enums\EstablishmentStatus;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

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
     * Un compte ne gère qu'un seul établissement.
     */
    public function create(User $user): Response
    {
        if (! $user->isEstablishmentAccount()) {
            return Response::deny();
        }

        return $user->establishments()->exists()
            ? Response::deny('Votre compte gère déjà un établissement : un compte ne peut gérer qu\'un seul établissement.')
            : Response::allow();
    }

    /**
     * Le contenu de la fiche appartient à l'établissement ; l'administration publie, suspend
     * ou vérifie (moderate) sans réécrire la fiche.
     */
    public function update(User $user, Establishment $establishment): bool
    {
        return $user->managesEstablishment($establishment);
    }

    /**
     * Ajouter, modifier ou retirer les membres de l'équipe : réservé aux propriétaires.
     */
    public function manageTeam(User $user, Establishment $establishment): bool
    {
        return $user->ownsEstablishment($establishment);
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
