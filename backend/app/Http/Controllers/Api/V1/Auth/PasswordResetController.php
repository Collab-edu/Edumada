<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

/**
 * Mot de passe oublié : envoi d'un lien par e-mail, puis choix d'un nouveau mot de passe.
 */
class PasswordResetController extends Controller
{
    /**
     * Même réponse que le compte existe ou non : la page ne révèle pas quelles adresses sont inscrites.
     */
    public function forgot(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);

        try {
            Password::sendResetLink(['email' => $validated['email']]);
        } catch (TransportExceptionInterface $exception) {
            // Serveur d'e-mails injoignable ou mal configuré : erreur enregistrée, message clair pour la personne.
            report($exception);

            return response()->json([
                'message' => "L'e-mail n'a pas pu être envoyé pour le moment. Réessayez dans quelques minutes.",
            ], 503);
        }

        return response()->json([
            'message' => 'Si un compte existe avec cette adresse, un e-mail vient de vous être envoyé avec un lien pour choisir un nouveau mot de passe.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset($validated, function (User $user, string $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            // Les sessions ouvertes ailleurs sont fermées.
            $user->tokens()->delete();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => 'Ce lien n\'est plus valable : il a déjà servi ou il a expiré. Demandez-en un nouveau.',
            ]);
        }

        return response()->json(['message' => 'Votre mot de passe a été modifié. Vous pouvez vous connecter.']);
    }
}
