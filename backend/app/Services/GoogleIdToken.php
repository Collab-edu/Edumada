<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Jeton d'identité « Se connecter avec Google » (Google Identity Services), envoyé par le site
 * ou le back-office : vérifié auprès de Google (signature, expiration), puis destinataire
 * (notre identifiant client) et adresse e-mail confirmée.
 */
class GoogleIdToken
{
    private const ENDPOINT = 'https://oauth2.googleapis.com/tokeninfo';

    private const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

    /** Connexion Google configurée (GOOGLE_CLIENT_ID dans .env). */
    public function enabled(): bool
    {
        return filled(config('services.google.client_id'));
    }

    /**
     * @return array{email: string, name: string, firstName: string|null, lastName: string|null}|null null si le jeton n'est pas valable
     */
    public function verify(string $credential): ?array
    {
        try {
            $response = Http::timeout(6)->get(self::ENDPOINT, ['id_token' => $credential]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
        if (! $response->successful()) {
            return null;
        }

        $claims = $response->json();
        $valid = ($claims['aud'] ?? null) === config('services.google.client_id')
            && in_array($claims['iss'] ?? null, self::ISSUERS, true)
            && in_array($claims['email_verified'] ?? null, [true, 'true'], true)
            && (int) ($claims['exp'] ?? 0) > time()
            && filled($claims['email'] ?? null);
        if (! $valid) {
            return null;
        }

        $email = strtolower($claims['email']);

        return [
            'email' => $email,
            'name' => $claims['name'] ?? $email,
            'firstName' => $claims['given_name'] ?? null,
            'lastName' => $claims['family_name'] ?? null,
        ];
    }
}
