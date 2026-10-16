<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminUserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'role' => ['nullable', Rule::enum(UserRole::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return AdminUserResource::collection(
            User::with('establishments')
                ->withCount('inquiries')
                ->when($filters['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
                ->when($filters['q'] ?? null, fn (Builder $query, string $text) => $query->where(
                    fn (Builder $query) => $query->where('name', 'like', "%{$text}%")->orWhere('email', 'like', "%{$text}%"),
                ))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        );
    }

    /**
     * Changement de type de compte. Un administrateur ne peut pas modifier son propre rôle.
     */
    public function update(Request $request, User $user): AdminUserResource
    {
        abort_if($user->is($request->user()), 422, 'Vous ne pouvez pas modifier votre propre rôle.');

        $validated = $request->validate(['role' => ['required', Rule::enum(UserRole::class)]]);
        $previous = $user->role;

        $user->role = UserRole::from($validated['role']);
        $user->save();
        AuditLog::record('user.role_changed', $user, ['from' => $previous->value, 'to' => $user->role->value]);

        return new AdminUserResource($user->load('establishments'));
    }

    public function destroy(Request $request, User $user): Response
    {
        abort_if($user->is($request->user()), 422, 'Vous ne pouvez pas supprimer votre propre compte ici.');

        AuditLog::record('user.deleted', null, ['email' => $user->email, 'role' => $user->role->value]);
        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }
}
