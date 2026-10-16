<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ManagedEstablishmentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
                ->with(['category', 'subCategory', 'publishedOffers.domain', 'offers.domain', 'offers.establishment.category'])
                ->orderBy('name')
                ->get(),
        );
    }
}
