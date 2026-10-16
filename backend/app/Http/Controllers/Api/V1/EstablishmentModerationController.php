<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EstablishmentStatus;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\EstablishmentModerationRequest;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Notifications\MembershipDecision;
use Illuminate\Support\Facades\Notification;

/**
 * Décisions réservées aux administrateurs : publier ou suspendre une fiche, accorder le badge
 * « vérifié » après contrôle réel, confirmer l'accréditation auprès des autorités.
 */
class EstablishmentModerationController extends Controller
{
    public function update(EstablishmentModerationRequest $request, Establishment $establishment): ManagedEstablishmentResource
    {
        $wasPending = $establishment->status === EstablishmentStatus::PendingReview;

        if ($request->has('status')) {
            $establishment->status = $request->validated('status');
        }

        if ($request->has('verification')) {
            $establishment->verification_status = $request->validated('verification');
            $establishment->verified_at = $establishment->verification_status === VerificationStatus::Verified ? now() : null;
        }

        if ($request->has('accreditationVerified')) {
            $establishment->accreditation_verified = $request->boolean('accreditationVerified');
        }

        $changes = $establishment->getDirty();
        $establishment->save();
        AuditLog::record('establishment.moderated', $establishment, array_map(fn ($value) => $value instanceof \BackedEnum ? $value->value : $value, $changes));

        // Réponse à une demande d'adhésion : publiée = acceptée, renvoyée en brouillon = refusée.
        if ($wasPending && in_array($establishment->status, [EstablishmentStatus::Published, EstablishmentStatus::Draft], true)) {
            $this->notifyDecision($establishment, $establishment->status === EstablishmentStatus::Published, $request->validated('note'));
        }

        return new ManagedEstablishmentResource($establishment->load(ManagedEstablishmentResource::RELATIONS));
    }

    private function notifyDecision(Establishment $establishment, bool $accepted, ?string $note): void
    {
        $notice = new MembershipDecision($establishment, $accepted, $note);
        Notification::send($establishment->members, $notice);
        if ($establishment->email) {
            Notification::route('mail', $establishment->email)->notify($notice);
        }
    }
}
