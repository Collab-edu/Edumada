<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ManagedEstablishmentResource;
use App\Models\AuditLog;
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
        ]);

        return ManagedEstablishmentResource::collection(
            Establishment::with(['category', 'subCategory', 'publishedOffers.domain', 'members'])
                ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
                ->when($filters['verification'] ?? null, fn (Builder $query, string $status) => $query->where('verification_status', $status))
                ->when($filters['q'] ?? null, fn (Builder $query, string $text) => $query->where(
                    fn (Builder $query) => $query->where('name', 'like', "%{$text}%")->orWhere('city', 'like', "%{$text}%"),
                ))
                ->latest('updated_at')
                ->paginate(20)
                ->withQueryString(),
        );
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

        $establishment->members()->syncWithoutDetaching([$user->id => ['role' => $validated['role']]]);
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
