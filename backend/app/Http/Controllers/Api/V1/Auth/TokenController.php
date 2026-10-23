<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\GoogleIdToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Connexion par jeton Bearer (Sanctum) : le site statique et le back-office appellent l'API
 * depuis une autre origine, sans cookie de session.
 */
class TokenController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Ces identifiants ne correspondent à aucun compte.',
            ]);
        }

        return response()->json([
            'token' => $user->createToken($request->validated('deviceName') ?? 'web')->plainTextToken,
            'user' => new UserResource($user->load('establishments')),
        ]);
    }

    /**
     * Connexion avec Google : le compte Edumada qui porte l'adresse du compte Google.
     */
    public function google(Request $request, GoogleIdToken $google): JsonResponse
    {
        $credential = $request->validate(['credential' => ['required', 'string', 'max:4096']])['credential'];
        abort_unless($google->enabled(), 503, "La connexion avec Google n'est pas encore activée.");

        $account = $google->verify($credential)
            ?? throw ValidationException::withMessages(['credential' => 'La connexion avec Google a échoué. Réessayez.']);
        $user = User::where('email', $account['email'])->first()
            ?? throw ValidationException::withMessages(['credential' => "Aucun compte Edumada n'utilise l'adresse {$account['email']}. Créez d'abord votre compte établissement."]);

        // L'adresse est confirmée par Google.
        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => new UserResource($user->load('establishments')),
        ]);
    }

    /**
     * Déconnexion : révoque le jeton utilisé pour la requête.
     */
    public function destroy(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
