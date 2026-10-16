<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\StatMetric;
use App\Http\Controllers\Controller;
use App\Models\DailyStat;
use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

/**
 * Mesures envoyées par le site (vues, impressions, clics), agrégées par jour, sans donnée personnelle.
 */
class TrackController extends Controller
{
    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'events' => ['required', 'array', 'max:50'],
            'events.*.type' => ['required', Rule::enum(StatMetric::class)],
            'events.*.establishment' => ['required', 'string', 'max:255'],
            'events.*.offer' => ['nullable', 'string', 'max:255'],
            'events.*.campaign' => ['nullable', 'integer'],
        ]);

        $events = collect($validated['events']);
        $establishments = Establishment::published()->whereIn('slug', $events->pluck('establishment')->unique())->pluck('id', 'slug');
        $offers = Offer::whereIn('slug', $events->pluck('offer')->filter()->unique())->get(['id', 'slug', 'establishment_id'])->keyBy('slug');

        $events
            ->map(function (array $event) use ($establishments, $offers): ?array {
                $establishmentId = $establishments[$event['establishment']] ?? null;
                $offer = isset($event['offer']) ? $offers->get($event['offer']) : null;

                if (! $establishmentId || ($offer && $offer->establishment_id !== $establishmentId)) {
                    return null;
                }

                return [$establishmentId, $offer?->id, $event['campaign'] ?? null, $event['type']];
            })
            ->filter()
            ->countBy(fn (array $key) => implode('|', $key))
            ->each(function (int $count, string $key): void {
                [$establishmentId, $offerId, $campaignId, $metric] = explode('|', $key);
                DailyStat::bump((int) $establishmentId, $offerId !== '' ? (int) $offerId : null, $campaignId !== '' ? (int) $campaignId : null, StatMetric::from($metric), $count);
            });

        return response()->noContent();
    }
}
