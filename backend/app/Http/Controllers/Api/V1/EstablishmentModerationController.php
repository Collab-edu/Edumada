<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\EstablishmentModerationRequest;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\Establishment;

/**
 * Décisions réservées aux administrateurs : publier ou suspendre une fiche, accorder le badge
 * « vérifié » après contrôle réel, confirmer l'accréditation auprès des autorités.
 */
class EstablishmentModerationController extends Controller
{
    public function update(EstablishmentModerationRequest $request, Establishment $establishment): ManagedEstablishmentResource
    {
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

        $establishment->save();

        return new ManagedEstablishmentResource($establishment->load(['category', 'subCategory', 'publishedOffers.domain', 'offers']));
    }
}
