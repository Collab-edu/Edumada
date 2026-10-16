<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\DomainRequest;
use App\Http\Resources\DomainResource;
use App\Models\Domain;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class DomainController extends Controller
{
    /**
     * Domaines avec le nombre réel d'offres publiées.
     */
    public function index(): AnonymousResourceCollection
    {
        return DomainResource::collection(
            Domain::withCount(['offers' => fn (Builder $offers) => $offers->whereIn('offers.id', Offer::published()->select('id'))])
                ->orderBy('position')
                ->get(),
        );
    }

    public function store(DomainRequest $request): DomainResource
    {
        Gate::authorize('create', Domain::class);

        $domain = Domain::create([
            ...$request->validated(),
            'slug' => Domain::uniqueSlug($request->validated('name')),
        ]);

        return new DomainResource($domain);
    }

    public function update(DomainRequest $request, Domain $domain): DomainResource
    {
        Gate::authorize('update', $domain);

        $domain->update($request->validated());

        return new DomainResource($domain);
    }

    /**
     * Les offres du domaine supprimé restent en ligne, sans domaine.
     */
    public function destroy(Domain $domain): Response
    {
        Gate::authorize('delete', $domain);

        $domain->delete();

        return response()->noContent();
    }
}
