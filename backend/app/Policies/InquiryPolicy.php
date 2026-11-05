<?php

namespace App\Policies;

use App\Enums\EstablishmentStatus;
use App\Models\Establishment;
use App\Models\Inquiry;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Demandes et candidatures : confidentielles. L'étudiant ne voit que les siennes ;
 * l'établissement ne voit que celles qui lui sont adressées, depuis la boîte de réception (Pro et Premium).
 */
class InquiryPolicy
{
    public const INBOX_DENIED = 'La boîte de réception des demandes est incluse dans les formules Pro et Premium. Avec la formule Gratuit, chaque demande vous est envoyée par e-mail.';

    /**
     * Seul un compte étudiant envoie une demande ou une candidature, vers une offre publiée.
     */
    public function create(User $user, Offer $offer): Response
    {
        if (! $user->isStudent()) {
            return Response::deny('Seul un compte étudiant peut envoyer une demande.');
        }

        return $offer->isPubliclyVisible() ? Response::allow() : Response::denyAsNotFound();
    }

    /**
     * Question à un établissement publié, sans offre précise : compte étudiant uniquement.
     */
    public function contact(User $user, Establishment $establishment): Response
    {
        if (! $user->isStudent()) {
            return Response::deny('Seul un compte étudiant peut envoyer une demande.');
        }

        return $establishment->status === EstablishmentStatus::Published ? Response::allow() : Response::denyAsNotFound();
    }

    /**
     * Boîte de réception d'un établissement.
     */
    public function viewInbox(User $user, Establishment $establishment): Response
    {
        if ($user->isAdmin()) {
            return Response::allow();
        }

        if (! $user->managesEstablishment($establishment)) {
            return Response::denyAsNotFound();
        }

        return $establishment->hasFeature('inquiryInbox') ? Response::allow() : Response::deny(self::INBOX_DENIED);
    }

    public function view(User $user, Inquiry $inquiry): Response
    {
        if ($inquiry->user_id === $user->id) {
            return Response::allow();
        }

        return $this->viewInbox($user, $inquiry->establishment);
    }

    /**
     * Écrire dans une conversation : l'étudiant auteur, ou l'équipe de l'établissement avec boîte de réception.
     */
    public function reply(User $user, Inquiry $inquiry): Response
    {
        if ($inquiry->user_id === $user->id) {
            return Response::allow();
        }

        return $user->managesEstablishment($inquiry->establishment) ? $this->viewInbox($user, $inquiry->establishment) : Response::denyAsNotFound();
    }

    /**
     * Changer le statut : l'établissement destinataire (avec boîte de réception) ou un administrateur.
     */
    public function updateStatus(User $user, Inquiry $inquiry): Response
    {
        return $this->viewInbox($user, $inquiry->establishment);
    }
}
