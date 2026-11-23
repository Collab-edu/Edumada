<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EstablishmentStatus;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Notifications\TeamAlert;
use App\Services\MailSender;
use Illuminate\Support\Facades\Gate;

/**
 * L'équipe demande la vérification de sa fiche (et sa publication si c'est un brouillon).
 * La décision reste à un administrateur, après contrôle réel.
 */
class VerificationRequestController extends Controller
{
    public function store(Establishment $establishment): ManagedEstablishmentResource
    {
        Gate::authorize('update', $establishment);

        if ($establishment->verification_status === VerificationStatus::Unverified) {
            $establishment->verification_status = VerificationStatus::Pending;
        }
        if ($establishment->status === EstablishmentStatus::Draft) {
            $establishment->status = EstablishmentStatus::PendingReview;
        }
        $changed = $establishment->isDirty();
        $establishment->save();

        AuditLog::record('establishment.verification_requested', $establishment);

        // Alerte seulement pour une nouvelle demande, pas pour un clic répété.
        if ($changed) {
            MailSender::toTeam(new TeamAlert(
                "Demande de vérification : {$establishment->name}",
                ["L'équipe de {$establishment->name} ({$establishment->city}) demande la vérification de sa fiche."],
                'Ouvrir la modération',
                '/admin/moderation/',
            ));
        }

        return new ManagedEstablishmentResource($establishment->load(ManagedEstablishmentResource::RELATIONS));
    }
}
