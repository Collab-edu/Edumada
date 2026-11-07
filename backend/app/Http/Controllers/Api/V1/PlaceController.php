<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Lieux de Madagascar pour le champ « Ville » (régions, districts, communes, villes, quartiers,
 * villages, fokontany…), d'après la carte OpenStreetMap, via Photon : service fait pour
 * l'autocomplétion. Chaque recherche est gardée 7 jours en cache.
 */
class PlaceController extends Controller
{
    private const ENDPOINT = 'https://photon.komoot.io/api/';

    /** Madagascar : longitude min, latitude min, longitude max, latitude max. */
    private const BBOX = '43.0,-25.7,50.6,-11.9';

    /** Type de lieu OpenStreetMap → libellé affiché. */
    private const KINDS = [
        'city' => 'Ville',
        'town' => 'Ville',
        'village' => 'Village',
        'hamlet' => 'Village',
        'suburb' => 'Quartier',
        'quarter' => 'Quartier',
        'neighbourhood' => 'Quartier',
        'locality' => 'Lieu-dit',
        'island' => 'Île',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = trim($request->validate(['q' => ['required', 'string', 'min:2', 'max:80']])['q']);

        $key = 'places:'.Str::slug($query);
        $places = Cache::get($key);
        if ($places === null) {
            $places = $this->search($query);
            // Seules les réponses de Photon sont gardées : une panne passagère ne s'installe pas pour 7 jours.
            if ($places !== null) {
                Cache::put($key, $places, now()->addDays(7));
            }
        }

        return response()->json(['data' => $places ?? []]);
    }

    /**
     * Lieu où se trouve la personne (bouton « Ma position actuelle ») : quartier ou localité et
     * leur commune, district et région, d'après le géocodage inverse d'OpenStreetMap (Nominatim).
     * Position arrondie à une centaine de mètres pour le cache (30 jours).
     */
    public function here(Request $request): JsonResponse
    {
        $point = $request->validate([
            'lat' => ['required', 'numeric', 'between:-26,-11'],
            'lng' => ['required', 'numeric', 'between:42,51'],
        ]);
        $lat = round((float) $point['lat'], 3);
        $lng = round((float) $point['lng'], 3);

        $key = "places:here:{$lat},{$lng}";
        $place = Cache::get($key);
        if ($place === null) {
            $place = $this->reverse($lat, $lng);
            if ($place !== null) {
                Cache::put($key, $place, now()->addDays(30));
            }
        }

        return response()->json(['data' => $place ?: null]);
    }

    /**
     * Adresse précise d'un établissement (fiche du back-office) : rues, quartiers, bâtiments et lieux
     * connus d'OpenStreetMap, avec la ville et la position à placer sur la carte. Cache 7 jours.
     */
    public function addresses(Request $request): JsonResponse
    {
        $query = trim($request->validate(['q' => ['required', 'string', 'min:3', 'max:120']])['q']);

        $key = 'places:address:'.Str::slug($query);
        $found = Cache::get($key);
        if ($found === null) {
            $found = $this->searchAddresses($query);
            if ($found !== null) {
                Cache::put($key, $found, now()->addDays(7));
            }
        }

        return response()->json(['data' => $found ?? []]);
    }

    /** Liens Google Maps acceptés : courts (à suivre) et complets (lus directement). */
    private const SHORT_MAP_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'g.co'];

    private const MAP_HOSTS = ['google.com', 'www.google.com', 'maps.google.com', 'google.mg', 'www.google.mg', 'maps.google.mg'];

    /**
     * Position d'un établissement introuvable sur OpenStreetMap, d'après le lien Google Maps collé
     * par l'établissement (« Partager » → « Copier le lien ») : coordonnées, nom du lieu et ville.
     */
    public function fromMapLink(Request $request): JsonResponse
    {
        $link = trim($request->validate(['url' => ['required', 'string', 'max:2048']])['url']);
        $host = Str::lower((string) parse_url($link, PHP_URL_HOST));
        if (! in_array($host, [...self::SHORT_MAP_HOSTS, ...self::MAP_HOSTS], true)) {
            return response()->json(['message' => 'Collez un lien Google Maps (bouton « Partager » de Google Maps).'], 422);
        }

        // Lien court : on suit la redirection pour lire l'adresse complète, qui contient la position.
        if (in_array($host, self::SHORT_MAP_HOSTS, true)) {
            try {
                $response = Http::timeout(6)->withOptions(['allow_redirects' => ['max' => 5]])->withHeaders(['User-Agent' => 'Mozilla/5.0 (Edumada)'])->get($link);
                $link = (string) ($response->effectiveUri() ?? $link);
            } catch (Throwable $exception) {
                report($exception);

                return response()->json(['message' => 'Lien Google Maps injoignable pour le moment. Réessayez.'], 422);
            }
        }

        $point = self::pointFromMapUrl(urldecode($link));
        if (! $point) {
            return response()->json(['message' => 'Position introuvable dans ce lien : ouvrez l\'établissement sur Google Maps, puis « Partager » → « Copier le lien ».'], 422);
        }
        [$lat, $lng] = $point;
        if ($lat < -26 || $lat > -11 || $lng < 42 || $lng > 51) {
            return response()->json(['message' => 'Ce lieu ne se trouve pas à Madagascar.'], 422);
        }

        // Nom du lieu dans l'adresse Google : …/maps/place/Nom+du+lieu/@…
        $name = preg_match('#/place/([^/@]+)#', urldecode($link), $m) ? trim(str_replace('+', ' ', $m[1])) : '';

        return response()->json(['data' => ['lat' => $lat, 'lng' => $lng, 'name' => $name, 'city' => $this->cityAt($lat, $lng) ?? '']]);
    }

    /**
     * Coordonnées dans une adresse Google Maps : repère exact (!3d…!4d…), puis paramètre q / ll, puis centre de la vue (@lat,lng).
     *
     * @return array{0: float, 1: float}|null
     */
    public static function pointFromMapUrl(string $url): ?array
    {
        $number = '(-?\d{1,2}\.\d+)';
        $patterns = ["/!3d{$number}!4d(-?\d{1,3}\.\d+)/", "/[?&](?:q|query|ll|center|destination)={$number},\s*(-?\d{1,3}\.\d+)/", "/@{$number},(-?\d{1,3}\.\d+)/"];
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $m)) {
                return [round((float) $m[1], 6), round((float) $m[2], 6)];
            }
        }

        return null;
    }

    /**
     * Ville d'un point (géocodage inverse OpenStreetMap), gardée 30 jours ; null si inconnue.
     */
    private function cityAt(float $lat, float $lng): ?string
    {
        return Cache::remember('places:city-at:'.round($lat, 3).','.round($lng, 3), now()->addDays(30), function () use ($lat, $lng) {
            try {
                $response = Http::timeout(6)
                    ->withHeaders(['User-Agent' => 'Edumada/1.0 ('.config('edumada.frontend_url').')'])
                    ->get('https://nominatim.openstreetmap.org/reverse', ['lat' => $lat, 'lon' => $lng, 'zoom' => 14, 'format' => 'jsonv2', 'accept-language' => 'fr']);
            } catch (Throwable $exception) {
                report($exception);

                return null;
            }
            $a = $response->successful() ? ($response->json('address') ?? []) : [];

            return $a['city'] ?? $a['town'] ?? $a['village'] ?? $a['county'] ?? null;
        });
    }

    /**
     * @return array<int, array{label: string, detail: string, city: string, lat: float, lng: float}>|null null si Photon n'a pas répondu
     */
    private function searchAddresses(string $query): ?array
    {
        $url = self::ENDPOINT.'?'.http_build_query(['q' => $query, 'bbox' => self::BBOX, 'limit' => 12, 'lang' => 'fr']);

        try {
            $response = Http::timeout(5)->withHeaders(['User-Agent' => 'Edumada/1.0 ('.config('edumada.frontend_url').')'])->get($url);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
        if (! $response->successful()) {
            return null;
        }

        $results = [];
        foreach ($response->json('features') ?? [] as $feature) {
            $p = $feature['properties'] ?? [];
            [$lng, $lat] = $feature['geometry']['coordinates'] ?? [null, null];
            if ($lat === null || ($p['countrycode'] ?? '') !== 'MG') {
                continue;
            }

            // « Lot II M 45 », « Rue Rainandriamampandry » ou nom du lieu (« Université d'Antananarivo »).
            $street = trim(($p['housenumber'] ?? '').' '.($p['street'] ?? ''));
            $label = collect([$p['name'] ?? null, $street ?: null])->filter()->unique()->implode(', ');
            $city = $p['city'] ?? $p['town'] ?? $p['village'] ?? $p['county'] ?? '';
            if ($label === '') {
                continue;
            }
            $detail = collect([$p['district'] ?? $p['locality'] ?? null, $city, $p['state'] ?? null])
                ->filter(fn (?string $part) => $part && $part !== $label)
                ->unique()
                ->implode(', ');

            $results[Str::lower($label.'|'.$detail)] ??= ['label' => $label, 'detail' => $detail, 'city' => $city, 'lat' => (float) $lat, 'lng' => (float) $lng];
        }

        return array_slice(array_values($results), 0, 8);
    }

    /**
     * @return array{name: string, kind: string, detail: string, lat: float, lng: float}|false|null false si aucun lieu, null si Nominatim n'a pas répondu
     */
    private function reverse(float $lat, float $lng): array|false|null
    {
        try {
            $response = Http::timeout(6)
                ->withHeaders(['User-Agent' => 'Edumada/1.0 ('.config('edumada.frontend_url').')'])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $lat,
                    'lon' => $lng,
                    'zoom' => 16,
                    'format' => 'jsonv2',
                    'accept-language' => 'fr',
                ]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
        if (! $response->successful()) {
            return null;
        }

        $address = $response->json('address') ?? [];
        if (($address['country_code'] ?? '') !== 'mg') {
            return false;
        }

        // Le plus précis d'abord : quartier, puis village ou ville.
        $levels = [
            'Quartier' => ['suburb', 'quarter', 'neighbourhood'],
            'Village' => ['village', 'hamlet'],
            'Ville' => ['town', 'city'],
            'Commune' => ['municipality'],
            'District' => ['county'],
        ];
        foreach ($levels as $kind => $keys) {
            foreach ($keys as $part) {
                if (! empty($address[$part])) {
                    $name = $address[$part];
                    $detail = collect([$address['city'] ?? $address['town'] ?? $address['village'] ?? null, $address['county'] ?? null, $address['state'] ?? null])
                        ->filter(fn (?string $value) => $value && $value !== $name)
                        ->unique()
                        ->take(2)
                        ->implode(', ');

                    return ['name' => $name, 'kind' => $kind, 'detail' => $detail, 'lat' => $lat, 'lng' => $lng];
                }
            }
        }

        return false;
    }

    /**
     * @return array<int, array{name: string, kind: string, detail: string, lat: float, lng: float}>|null null si Photon n'a pas répondu
     */
    private function search(string $query): ?array
    {
        // Lieux habités et limites administratives seulement (pas d'arrêts de bus ni de commerces).
        $url = self::ENDPOINT.'?'.http_build_query(['q' => $query, 'bbox' => self::BBOX, 'limit' => 15, 'lang' => 'fr'])
            .'&osm_tag=place&osm_tag=boundary:administrative';

        try {
            $response = Http::timeout(5)->withHeaders(['User-Agent' => 'Edumada/1.0 ('.config('edumada.frontend_url').')'])->get($url);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
        if (! $response->successful()) {
            return null;
        }

        $places = [];
        foreach ($response->json('features') ?? [] as $feature) {
            $properties = $feature['properties'] ?? [];
            [$lng, $lat] = $feature['geometry']['coordinates'] ?? [null, null];
            $name = $properties['name'] ?? null;
            if (! $name || $lat === null || ($properties['countrycode'] ?? '') !== 'MG') {
                continue;
            }

            $kind = $this->kind($properties);
            if ($kind === null) {
                continue;
            }

            // Où se trouve le lieu : district (ou commune) puis région, sans répéter son propre nom.
            $detail = collect([$properties['county'] ?? $properties['city'] ?? null, $properties['state'] ?? null])
                ->filter(fn (?string $part) => $part && $part !== $name)
                ->unique()
                ->implode(', ');

            $key = Str::lower($name.'|'.$detail);
            $places[$key] ??= ['name' => $name, 'kind' => $kind, 'detail' => $detail, 'lat' => (float) $lat, 'lng' => (float) $lng];
        }

        return array_slice(array_values($places), 0, 8);
    }

    /**
     * @param  array<string, mixed>  $properties
     */
    private function kind(array $properties): ?string
    {
        if (($properties['osm_key'] ?? '') === 'boundary') {
            return match ($properties['type'] ?? '') {
                'state' => 'Région',
                'county' => 'District',
                default => 'Commune',
            };
        }

        return self::KINDS[$properties['osm_value'] ?? ''] ?? null;
    }
}
