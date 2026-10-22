<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Position d'un lieu de Madagascar (« Talatamaty », « Ivato »…) via le géocodage d'OpenStreetMap
 * (Nominatim). Chaque lieu n'est demandé qu'une fois : le résultat, même vide, est gardé en cache.
 */
class PlaceLocator
{
    private const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

    /**
     * @return array{lat: float, lng: float, label: string}|null
     */
    public function locate(string $place): ?array
    {
        $place = trim($place);
        if ($place === '') {
            return null;
        }

        $key = 'place:'.Str::slug($place);
        $cached = Cache::get($key);
        if ($cached !== null) {
            return $cached ?: null;
        }

        $found = $this->query($place);
        // Lieu trouvé : gardé 90 jours ; introuvable : redemandé le lendemain (false = « déjà cherché »).
        Cache::put($key, $found ?? false, $found ? now()->addDays(90) : now()->addDay());

        return $found;
    }

    /**
     * @return array{lat: float, lng: float, label: string}|null
     */
    private function query(string $place): ?array
    {
        try {
            $response = Http::timeout(6)
                ->withHeaders(['User-Agent' => 'Edumada/1.0 ('.config('edumada.frontend_url').')'])
                ->get(self::ENDPOINT, [
                    'q' => $place,
                    'countrycodes' => 'mg',
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'accept-language' => 'fr',
                ]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }

        $first = $response->successful() ? ($response->json()[0] ?? null) : null;
        if (! is_array($first) || ! isset($first['lat'], $first['lon'])) {
            return null;
        }

        return [
            'lat' => (float) $first['lat'],
            'lng' => (float) $first['lon'],
            'label' => (string) ($first['display_name'] ?? $place),
        ];
    }
}
