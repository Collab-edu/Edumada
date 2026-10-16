<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Profil du compte connecté : coordonnées, mot de passe, suppression du compte.
 */
class ProfileController extends Controller
{
    public function update(Request $request): UserResource
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'studyLevel' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (array_key_exists('studyLevel', $validated)) {
            $validated['study_level'] = $validated['studyLevel'];
            unset($validated['studyLevel']);
        }

        $user->fill($validated);
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        return new UserResource($user->load('establishments'));
    }

    public function updatePassword(Request $request): Response
    {
        $validated = $request->validate([
            'currentPassword' => ['required', 'current_password:sanctum'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update(['password' => $validated['password']]);

        return response()->noContent();
    }

    /**
     * Suppression du compte et des données personnelles de l'étudiant (demandes et documents compris).
     */
    public function destroy(Request $request): Response
    {
        $request->validate(['password' => ['required', 'current_password:sanctum']]);
        $user = $request->user();

        DB::transaction(function () use ($user): void {
            foreach ($user->inquiries()->with('attachments')->get() as $inquiry) {
                Storage::disk('local')->deleteDirectory("inquiries/{$inquiry->id}");
                $inquiry->delete();
            }
            AuditLog::record('user.deleted', null, ['email' => $user->email, 'role' => $user->role->value], $user);
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->noContent();
    }
}
