<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EstablishmentStatus;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Establishment;
use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * Avis publiés (format `TestimonialType`), d'établissements publiés.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'establishment' => ['nullable', 'string', 'max:255'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        return ReviewResource::collection(
            Review::where('status', ReviewStatus::Published)
                ->whereHas('establishment', fn (Builder $query) => $query->published())
                ->when($filters['establishment'] ?? null, fn (Builder $query, string $slug) => $query->whereHas(
                    'establishment', fn (Builder $establishment) => $establishment->where('slug', $slug),
                ))
                ->with(['establishment', 'offer'])
                ->orderBy('id')
                ->paginate($filters['perPage'] ?? 50)
                ->withQueryString(),
        );
    }

    /**
     * Un étudiant laisse un avis ; il n'apparaît qu'après modération.
     */
    public function store(Request $request, Establishment $establishment): JsonResponse
    {
        abort_unless($request->user()->isStudent(), 403, 'Seul un compte étudiant peut laisser un avis.');
        abort_unless($establishment->status === EstablishmentStatus::Published, 404);

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'quote' => ['required', 'string', 'min:20', 'max:1500'],
            'status' => ['nullable', 'string', 'max:100'],
            'formationId' => ['nullable', 'string', Rule::exists('offers', 'slug')->where('establishment_id', $establishment->id)],
        ]);

        $user = $request->user();
        $review = $establishment->reviews()->create([
            'offer_id' => isset($validated['formationId']) ? $establishment->offers()->where('slug', $validated['formationId'])->value('id') : null,
            'user_id' => $user->id,
            'author_name' => self::displayName($user->name),
            'author_status' => $validated['status'] ?? null,
            'rating' => $validated['rating'],
            'quote' => $validated['quote'],
        ]);

        return response()->json([
            'data' => ['id' => (string) $review->id, 'status' => ReviewStatus::Pending->value],
            'message' => 'Merci ! Votre avis sera publié après vérification par Edumada.',
        ], 201);
    }

    /**
     * « Fanja Rakoto » → « Fanja R. » : prénom et initiale du nom, comme sur le site.
     */
    public static function displayName(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [$name];

        return count($parts) > 1 ? $parts[0].' '.mb_strtoupper(mb_substr(end($parts), 0, 1)).'.' : $parts[0];
    }
}
