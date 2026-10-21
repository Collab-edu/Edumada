<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EstablishmentMemberRole;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\TeamMemberRequest;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Models\User;
use App\Notifications\TeamMemberAdded;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Équipe d'un établissement : les comptes qui gèrent sa fiche depuis le back-office.
 * Toute l'équipe voit la liste ; seuls les propriétaires ajoutent, modifient ou retirent un membre.
 * Un compte ne gère qu'un seul établissement.
 */
class TeamController extends Controller
{
    public function index(Request $request, Establishment $establishment): JsonResponse
    {
        Gate::authorize('update', $establishment);

        return response()->json(['data' => $this->members($establishment, $request->user())]);
    }

    public function store(TeamMemberRequest $request, Establishment $establishment): JsonResponse
    {
        Gate::authorize('manageTeam', $establishment);
        $validated = $request->validated();
        $role = EstablishmentMemberRole::from($validated['role']);

        $user = User::where('email', $validated['email'])->first();
        $newAccount = $user === null;

        if ($user !== null) {
            if ($establishment->members()->whereKey($user->id)->exists()) {
                throw ValidationException::withMessages(['email' => 'Cette personne fait déjà partie de l\'équipe.']);
            }
            if ($user->role !== UserRole::Establishment) {
                throw ValidationException::withMessages(['email' => 'Cette adresse correspond à un compte étudiant ou administrateur : utilisez une autre adresse.']);
            }
        }

        DB::transaction(function () use (&$user, $validated, $establishment, $role): void {
            if ($user === null) {
                $user = new User([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => $validated['password'],
                    'job_title' => $validated['jobTitle'] ?? null,
                ]);
                // Le rôle n'est pas assignable en masse : fixé explicitement.
                $user->role = UserRole::Establishment;
                $user->save();
            }
            $establishment->addMember($user, $role);
            AuditLog::record('establishment.member_added', $establishment, ['user' => $user->email, 'role' => $role->value]);
        });

        $user->notify(new TeamMemberAdded($establishment, $request->user()->name, $newAccount));

        return response()->json([
            'data' => $this->members($establishment, $request->user()),
            'message' => "{$user->name} fait maintenant partie de l'équipe.",
        ], 201);
    }

    public function update(Request $request, Establishment $establishment, User $user): JsonResponse
    {
        Gate::authorize('manageTeam', $establishment);
        abort_unless($establishment->members()->whereKey($user->id)->exists(), 404);
        $role = EstablishmentMemberRole::from($request->validate([
            'role' => ['required', Rule::enum(EstablishmentMemberRole::class)],
        ])['role']);

        if ($role !== EstablishmentMemberRole::Owner && $this->isLastOwner($establishment, $user)) {
            throw ValidationException::withMessages(['role' => 'L\'établissement doit garder au moins un propriétaire.']);
        }

        $establishment->members()->updateExistingPivot($user->id, ['role' => $role->value]);
        AuditLog::record('establishment.member_updated', $establishment, ['user' => $user->email, 'role' => $role->value]);

        return response()->json(['data' => $this->members($establishment, $request->user())]);
    }

    public function destroy(Request $request, Establishment $establishment, User $user): Response
    {
        Gate::authorize('manageTeam', $establishment);
        abort_unless($establishment->members()->whereKey($user->id)->exists(), 404);

        if ($this->isLastOwner($establishment, $user)) {
            throw ValidationException::withMessages(['user' => 'L\'établissement doit garder au moins un propriétaire.']);
        }

        $establishment->members()->detach($user->id);
        // La personne retirée perd aussitôt l'accès au back-office.
        $user->tokens()->delete();
        AuditLog::record('establishment.member_removed', $establishment, ['user' => $user->email]);

        return response()->noContent();
    }

    private function isLastOwner(Establishment $establishment, User $user): bool
    {
        $role = $establishment->members()->whereKey($user->id)->first()?->pivot->role;

        return $role === EstablishmentMemberRole::Owner->value && $establishment->ownersCount() <= 1;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function members(Establishment $establishment, User $viewer): array
    {
        return $establishment->members()
            ->orderByPivot('created_at')
            ->get()
            ->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'jobTitle' => $member->job_title,
                'role' => $member->pivot->role,
                'roleLabel' => EstablishmentMemberRole::from($member->pivot->role)->label(),
                'addedAt' => $member->pivot->created_at?->toIso8601String(),
                'isYou' => $member->is($viewer),
            ])
            ->all();
    }
}
