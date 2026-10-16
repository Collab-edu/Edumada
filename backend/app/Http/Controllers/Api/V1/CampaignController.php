<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Http\Resources\OfferResource;
use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Domain;
use App\Models\Establishment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Campagnes Premium : emplacements clairement identifiés comme « Sponsorisé ».
 */
class CampaignController extends Controller
{
    private const RELATIONS = ['offer', 'establishment', 'targetCategory', 'targetDomain'];

    public function index(Establishment $establishment): AnonymousResourceCollection
    {
        Gate::authorize('update', $establishment);

        return CampaignResource::collection($establishment->campaigns()->with(self::RELATIONS)->latest('starts_on')->get());
    }

    public function store(Request $request, Establishment $establishment): CampaignResource
    {
        Gate::authorize('update', $establishment);
        abort_unless(
            $request->user()->isAdmin() || $establishment->hasFeature('sponsoredPlacement'),
            403,
            'Les campagnes sponsorisées sont incluses dans la formule Premium.',
        );

        $campaign = $establishment->campaigns()->make($this->attributes($request, $establishment, required: true));
        $campaign->save();
        AuditLog::record('campaign.created', $campaign);

        return new CampaignResource($campaign->load(self::RELATIONS));
    }

    public function update(Request $request, Campaign $campaign): CampaignResource
    {
        Gate::authorize('update', $campaign->establishment);

        $campaign->update($this->attributes($request, $campaign->establishment, required: false));

        return new CampaignResource($campaign->load(self::RELATIONS));
    }

    public function destroy(Campaign $campaign): Response
    {
        Gate::authorize('update', $campaign->establishment);

        $campaign->delete();

        return response()->noContent();
    }

    /**
     * Offres sponsorisées à afficher pour une recherche (catégorie, domaine, ville), en rotation.
     */
    public function sponsored(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'domain' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'limit' => ['nullable', 'integer', 'between:1,6'],
        ]);

        $campaigns = Campaign::running()
            ->whereHas('offer', fn (Builder $offer) => $offer->published())
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where(fn (Builder $query) => $query
                ->whereNull('target_category_id')
                ->orWhereHas('targetCategory', fn (Builder $categories) => $categories->where('slug', $category)->orWhere('short_label', $category))))
            ->when($filters['domain'] ?? null, fn (Builder $query, string $domain) => $query->where(fn (Builder $query) => $query
                ->whereNull('target_domain_id')
                ->orWhereHas('targetDomain', fn (Builder $domains) => $domains->where('name', $domain))))
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $query->where(fn (Builder $query) => $query
                ->whereNull('target_city')
                ->orWhere('target_city', $city)))
            ->with(['establishment', 'offer.establishment.category', 'offer.domain'])
            ->inRandomOrder()
            ->limit(20)
            ->get()
            ->filter(fn (Campaign $campaign) => $campaign->establishment->hasFeature('sponsoredPlacement'))
            ->unique('offer_id')
            ->take($filters['limit'] ?? 2)
            ->values();

        return response()->json(['data' => $campaigns->map(fn (Campaign $campaign) => [
            'campaignId' => $campaign->id,
            'title' => $campaign->title,
            'description' => $campaign->description,
            'image' => $campaign->image,
            'callToAction' => $campaign->call_to_action,
            'offer' => new OfferResource($campaign->offer),
        ])]);
    }

    /**
     * @return array<string, mixed>
     */
    private function attributes(Request $request, Establishment $establishment, bool $required): array
    {
        $rule = $required ? 'required' : 'sometimes';
        $validated = $request->validate([
            'offer' => [$rule, 'string', Rule::exists('offers', 'slug')->where('establishment_id', $establishment->id)->where('status', 'published')->whereNull('deleted_at')],
            'title' => [$rule, 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'image' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'callToAction' => ['sometimes', 'nullable', 'string', 'max:60'],
            'startsOn' => [$rule, 'date', ...($required ? ['after_or_equal:today'] : [])],
            'endsOn' => [$rule, 'date', 'after_or_equal:startsOn'],
            'targetCategory' => ['sometimes', 'nullable', 'string', Rule::exists('categories', 'slug')],
            'targetDomain' => ['sometimes', 'nullable', 'string', Rule::exists('domains', 'name')],
            'targetCity' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', Rule::enum(CampaignStatus::class)],
        ]);

        $map = [
            'title' => 'title', 'description' => 'description', 'image' => 'image', 'callToAction' => 'call_to_action',
            'startsOn' => 'starts_on', 'endsOn' => 'ends_on', 'targetCity' => 'target_city', 'status' => 'status',
        ];
        $attributes = [];
        foreach ($map as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }
        if (array_key_exists('offer', $validated)) {
            $attributes['offer_id'] = $establishment->offers()->where('slug', $validated['offer'])->value('id');
        }
        if (array_key_exists('targetCategory', $validated)) {
            $attributes['target_category_id'] = $validated['targetCategory'] ? Category::where('slug', $validated['targetCategory'])->value('id') : null;
        }
        if (array_key_exists('targetDomain', $validated)) {
            $attributes['target_domain_id'] = $validated['targetDomain'] ? Domain::where('name', $validated['targetDomain'])->value('id') : null;
        }

        return $attributes;
    }
}
