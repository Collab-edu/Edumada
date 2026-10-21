<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ClaimStatus;
use App\Http\Controllers\Controller;
use App\Models\Establishment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Un compte établissement revendique une fiche existante ; un administrateur contrôle
 * son droit à représenter l'établissement avant de lui en donner la gestion.
 */
class EstablishmentClaimController extends Controller
{
    public function store(Request $request, Establishment $establishment): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isEstablishmentAccount(), 403, 'Seul un compte établissement peut revendiquer une fiche.');

        if ($user->managesEstablishment($establishment)) {
            return response()->json(['message' => 'Vous gérez déjà cette fiche.'], 422);
        }
        if ($user->establishments()->exists()) {
            return response()->json(['message' => 'Votre compte gère déjà un établissement : un compte ne peut gérer qu\'un seul établissement.'], 422);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'min:20', 'max:2000'],
        ]);

        $claim = $establishment->claims()->where('user_id', $user->id)->where('status', ClaimStatus::Pending)->first()
            ?? $establishment->claims()->create(['user_id' => $user->id, 'message' => $validated['message']]);

        return response()->json([
            'data' => ['id' => $claim->id, 'status' => $claim->status->value],
            'message' => 'Demande envoyée. Edumada vous contactera pour vérifier votre lien avec l\'établissement.',
        ], 201);
    }
}
