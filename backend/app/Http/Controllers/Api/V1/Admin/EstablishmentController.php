<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentStatus;
use App\Enums\PlanCode;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Toutes les fiches (brouillons, en attente, suspendues) et leurs équipes.
 */
class EstablishmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(EstablishmentStatus::class)],
            'verification' => ['nullable', Rule::enum(VerificationStatus::class)],
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', Rule::exists('categories', 'slug')],
            'plan' => ['nullable', Rule::enum(PlanCode::class)],
        ]);

        return ManagedEstablishmentResource::collection(
            Establishment::with(['category', 'subCategory', 'publishedOffers.domain', 'members'])
                ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
                ->when($filters['verification'] ?? null, fn (Builder $query, string $status) => $query->where('verification_status', $status))
                ->when($filters['category'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('category', fn (Builder $query) => $query->where('slug', $slug)))
                ->when($filters['plan'] ?? null, fn (Builder $query, string $plan) => $query->onPlan(PlanCode::from($plan)))
                ->when($filters['q'] ?? null, fn (Builder $query, string $text) => $query->where(
                    fn (Builder $query) => $query->where('name', 'like', "%{$text}%")->orWhere('city', 'like', "%{$text}%"),
                ))
                ->latest('updated_at')
                ->paginate(20)
                ->withQueryString(),
        );
    }

    /**
     * Compteurs du menu et des onglets : nouvelles demandes d'adhésion (en attente de validation),
     * fiches inscrites (publiées) et autres, par catégorie ; formules des fiches inscrites.
     */
    public function counts(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', Rule::exists('categories', 'slug')],
        ]);

        $rows = Establishment::query()
            ->selectRaw('category_id, status, count(*) as total')
            ->groupBy('category_id', 'status')
            ->toBase()
            ->get();

        $tally = function ($rows): array {
            $count = fn (string $status) => (int) $rows->where('status', $status)->sum('total');

            return [
                'new' => $count(EstablishmentStatus::PendingReview->value),
                'registered' => $count(EstablishmentStatus::Published->value),
                'other' => $count(EstablishmentStatus::Draft->value) + $count(EstablishmentStatus::Suspended->value),
            ];
        };

        $categories = Category::orderBy('position')->get();
        $scope = isset($filters['category']) ? $categories->firstWhere('slug', $filters['category']) : null;

        $registered = Establishment::published()->when($scope, fn (Builder $query) => $query->where('category_id', $scope->id));
        $plans = collect(PlanCode::cases())->mapWithKeys(fn (PlanCode $plan) => [
            $plan->value => (clone $registered)->onPlan($plan)->count(),
        ]);

        return response()->json(['data' => [
            'total' => $tally($rows),
            'categories' => $categories->map(fn (Category $category) => [
                'id' => $category->slug,
                'label' => $category->label,
                'shortLabel' => $category->short_label,
                ...$tally($rows->where('category_id', $category->id)),
            ])->values(),
            'plans' => $plans,
        ]]);
    }

    /**
     * Donne la gestion d'une fiche à un compte établissement existant.
     */
    public function storeMember(Request $request, Establishment $establishment): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::exists('users', 'email')],
            'role' => ['required', Rule::enum(EstablishmentMemberRole::class)],
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();
        if ($user->role !== UserRole::Establishment) {
            throw ValidationException::withMessages(['email' => 'Ce compte n\'est pas un compte établissement.']);
        }

        $establishment->addMember($user, EstablishmentMemberRole::from($validated['role']));
        AuditLog::record('establishment.member_added', $establishment, ['user' => $user->email, 'role' => $validated['role']]);

        return response()->json(['message' => "{$user->name} peut désormais gérer cette fiche."], 201);
    }

    public function destroyMember(Establishment $establishment, User $user): Response
    {
        $establishment->members()->detach($user->id);
        AuditLog::record('establishment.member_removed', $establishment, ['user' => $user->email]);

        return response()->noContent();
    }
}
