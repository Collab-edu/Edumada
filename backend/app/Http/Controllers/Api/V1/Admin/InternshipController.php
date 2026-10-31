<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OfferKind;
use App\Http\Controllers\Controller;
use App\Http\Resources\ManagedOfferResource;
use App\Models\Offer;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Offres de stage, publiées uniquement par l'administration Edumada.
 */
class InternshipController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ManagedOfferResource::collection(
            Offer::where('kind', OfferKind::Internship)->with(['domain', 'establishment.category'])->latest('updated_at')->paginate(50),
        );
    }
}
