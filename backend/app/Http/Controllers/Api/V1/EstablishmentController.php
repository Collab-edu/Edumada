<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentSector;
use App\Enums\EstablishmentStatus;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\EstablishmentRequest;
use App\Http\Resources\EstablishmentDetailResource;
use App\Http\Resources\EstablishmentResource;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\AuditLog;
use App\Models\Establishment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class EstablishmentController extends Controller
{
    /**
     * Fiches publiées, filtrables par mot-clé, catégorie, ville et type.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(EstablishmentSector::labels())],
            'verified' => ['nullable', 'boolean'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $establishments = Establishment::published()
            ->with(['category', 'subCategory', 'publishedOffers.domain'])
            ->when($filters['q'] ?? null, fn (Builder $query, string $text) => $query->whereContains('name', $text))
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->whereHas(
                'category', fn (Builder $categories) => $categories->where('slug', $category)->orWhere('short_label', $category),
            ))
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $query->where('city', $city))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('sector', EstablishmentSector::fromLabel($type)))
            ->when($request->boolean('verified'), fn (Builder $query) => $query->where('verification_status', VerificationStatus::Verified))
            ->orderBy('name')
            ->paginate($filters['perPage'] ?? 24)
            ->withQueryString();

        return EstablishmentResource::collection($establishments);
    }

    /**
     * Fiche complète. Un brouillon n'est visible que par son équipe et les administrateurs
     * (jeton facultatif) ; pour les autres, il n'existe pas.
     */
    public function show(Request $request, Establishment $establishment): EstablishmentDetailResource
    {
        abort_unless(Gate::forUser($request->user('sanctum'))->allows('view', $establishment), 404);

        return new EstablishmentDetailResource($establishment->load([
            'category.subCategories',
            'subCategory',
            'publishedOffers.domain',
            'publishedOffers.establishment.category',
            'publishedReviews.establishment',
            'publishedReviews.offer',
        ]));
    }

    /**
     * Un compte établissement crée sa fiche et en devient propriétaire ; elle part en validation.
     */
    public function store(EstablishmentRequest $request): ManagedEstablishmentResource
    {
        Gate::authorize('create', Establishment::class);

        $establishment = DB::transaction(function () use ($request): Establishment {
            $establishment = new Establishment($request->establishmentAttributes());
            $establishment->slug = Establishment::uniqueSlug($establishment->name);
            $establishment->status = EstablishmentStatus::PendingReview;
            $establishment->verification_status = VerificationStatus::Unverified;
            $establishment->save();

            if ($request->user()->isEstablishmentAccount()) {
                $establishment->members()->attach($request->user(), ['role' => EstablishmentMemberRole::Owner->value]);
            }

            return $establishment;
        });

        return new ManagedEstablishmentResource($establishment->load(ManagedEstablishmentResource::RELATIONS));
    }

    public function update(EstablishmentRequest $request, Establishment $establishment): ManagedEstablishmentResource
    {
        Gate::authorize('update', $establishment);

        $establishment->update($request->establishmentAttributes());

        return new ManagedEstablishmentResource($establishment->load(ManagedEstablishmentResource::RELATIONS));
    }

    /**
     * Suppression douce : la fiche disparaît du site mais reste récupérable.
     */
    public function destroy(Establishment $establishment): Response
    {
        Gate::authorize('delete', $establishment);

        $establishment->delete();
        AuditLog::record('establishment.deleted', $establishment, ['name' => $establishment->name]);

        return response()->noContent();
    }
}
