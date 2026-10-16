<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\OfferRequest;
use App\Http\Requests\OfferSearchRequest;
use App\Http\Resources\ManagedOfferResource;
use App\Http\Resources\OfferPageResource;
use App\Http\Resources\OfferResource;
use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class OfferController extends Controller
{
    /**
     * Recherche des offres publiées (filtres de la page /recherche).
     */
    public function index(OfferSearchRequest $request): AnonymousResourceCollection
    {
        $offers = Offer::published()
            ->with(['establishment.category', 'domain'])
            ->matchingSearch($request->validated())
            ->paginate($request->validated('perPage') ?? 24)
            ->withQueryString();

        return OfferResource::collection($offers);
    }

    /**
     * Fiche offre : `FormationType`, contenu détaillé et établissement.
     * Un brouillon n'est visible que par l'équipe de l'établissement et les administrateurs.
     */
    public function show(Request $request, Offer $offer): OfferPageResource
    {
        abort_unless(Gate::forUser($request->user('sanctum'))->allows('view', $offer), 404);

        return new OfferPageResource($offer->load([
            'domain',
            'establishment.category',
            'establishment.subCategory',
            'establishment.publishedOffers.domain',
        ]));
    }

    public function store(OfferRequest $request, Establishment $establishment): ManagedOfferResource
    {
        Gate::authorize('create', [Offer::class, $establishment]);

        $offer = $establishment->offers()->make($request->offerAttributes());
        $offer->slug = Offer::uniqueSlug($offer->title.' '.($establishment->initials ?: $establishment->name));
        $offer->save();

        return new ManagedOfferResource($offer->load(['domain', 'establishment.category']));
    }

    public function update(OfferRequest $request, Offer $offer): ManagedOfferResource
    {
        Gate::authorize('update', $offer);

        $offer->update($request->offerAttributes());

        return new ManagedOfferResource($offer->load(['domain', 'establishment.category']));
    }

    public function destroy(Offer $offer): Response
    {
        Gate::authorize('delete', $offer);

        $offer->delete();

        return response()->noContent();
    }
}
