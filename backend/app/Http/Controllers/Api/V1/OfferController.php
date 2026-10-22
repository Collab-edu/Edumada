<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\OfferRequest;
use App\Http\Requests\OfferSearchRequest;
use App\Http\Resources\ManagedOfferResource;
use App\Http\Resources\OfferPageResource;
use App\Http\Resources\OfferResource;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Models\Offer;
use App\Services\PlaceLocator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class OfferController extends Controller
{
    /**
     * Recherche des offres publiées (filtres de la page /recherche).
     */
    public function index(OfferSearchRequest $request, PlaceLocator $places): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = $filters['perPage'] ?? 24;
        $search = fn (array $filters) => Offer::published()->with(['establishment.category', 'domain'])->matchingSearch($filters);

        $offers = $search($filters)->paginate($perPage)->withQueryString();
        $city = trim($filters['city'] ?? '');

        // Aucune offre dans ce lieu (« Talatamaty ») : les plus proches, de la plus près à la plus loin.
        if ($offers->total() === 0 && $city !== '') {
            $point = $places->locate($city);
            if ($point === null) {
                return OfferResource::collection($offers)->additional(['near' => null, 'placeNotFound' => true]);
            }

            $nearby = $search([...$filters, 'city' => null])
                ->nearest($point['lat'], $point['lng'])
                ->paginate($perPage)
                ->withQueryString();

            return OfferResource::collection($nearby)->additional([
                'near' => ['place' => $city, 'label' => $point['label'], 'lat' => $point['lat'], 'lng' => $point['lng']],
            ]);
        }

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

        $offer->fill($request->offerAttributes());
        if ($offer->isDirty('status')) {
            AuditLog::record('offer.status_changed', $offer, ['from' => $offer->getOriginal('status')?->value, 'to' => $offer->status->value]);
        }
        $offer->save();

        return new ManagedOfferResource($offer->load(['domain', 'establishment.category']));
    }

    public function destroy(Offer $offer): Response
    {
        Gate::authorize('delete', $offer);

        $offer->delete();
        AuditLog::record('offer.deleted', $offer, ['title' => $offer->title]);

        return response()->noContent();
    }
}
