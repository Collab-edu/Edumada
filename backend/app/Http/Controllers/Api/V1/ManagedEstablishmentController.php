<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\Establishment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

/**
 * Établissements que l'utilisateur connecté représente, avec toutes leurs offres
 * (brouillons compris) : point d'entrée du tableau de bord établissement.
 */
class ManagedEstablishmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ManagedEstablishmentResource::collection(
            $request->user()->establishments()
                ->with(ManagedEstablishmentResource::RELATIONS)
                ->orderBy('name')
                ->get(),
        );
    }

    /**
     * Une fiche vue par son équipe ou par un administrateur, brouillons compris.
     */
    public function show(Establishment $establishment): ManagedEstablishmentResource
    {
        Gate::authorize('update', $establishment);

        return new ManagedEstablishmentResource($establishment->load([...ManagedEstablishmentResource::RELATIONS, 'members']));
    }
}
