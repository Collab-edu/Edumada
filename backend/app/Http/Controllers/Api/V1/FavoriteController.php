<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OfferResource;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Formations enregistrées en favoris par l'utilisateur connecté.
 */
class FavoriteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return OfferResource::collection(
            $request->user()->favoriteOffers()
                ->published()
                ->with(['establishment.category', 'domain'])
                ->orderByPivot('created_at', 'desc')
                ->get(),
        );
    }

    public function update(Request $request, Offer $offer): Response
    {
        abort_unless($offer->isPubliclyVisible(), 404);

        $request->user()->favoriteOffers()->syncWithoutDetaching([$offer->id]);

        return response()->noContent();
    }

    public function destroy(Request $request, Offer $offer): Response
    {
        $request->user()->favoriteOffers()->detach($offer->id);

        return response()->noContent();
    }
}
