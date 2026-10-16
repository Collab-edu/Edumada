<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryType;
use App\Enums\StatMetric;
use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\DailyStat;
use App\Models\Establishment;
use App\Models\Offer;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * Statistiques d'un établissement : standard (Pro) ou avancées (Premium).
 * La comparaison avec la période précédente n'est donnée que si celle-ci contient des données.
 */
class EstablishmentStatsController extends Controller
{
    public function show(Request $request, Establishment $establishment): JsonResponse
    {
        Gate::authorize('update', $establishment);

        $level = $request->user()->isAdmin() ? 'advanced' : $establishment->statisticsLevel();
        abort_if($level === 'none', 403, 'Les statistiques sont incluses dans les formules Pro (standard) et Premium (avancées).');

        $request->validate(['days' => ['nullable', 'integer', 'between:7,365']]);
        $days = $request->integer('days', 30);
        $to = CarbonImmutable::today();
        $from = $to->subDays($days - 1);

        $stats = $this->stats($establishment, $from, $to);
        $previous = $this->stats($establishment, $from->subDays($days), $from->subDay());
        $inquiries = $establishment->inquiries()->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])->get(['id', 'type', 'offer_id', 'created_at', 'status']);
        $offers = $establishment->offers()->get(['id', 'slug', 'title', 'status']);

        $totals = $this->totals($stats, $inquiries);
        $data = [
            'level' => $level,
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'days' => $days],
            'totals' => $totals,
            'previousTotals' => $previous->isNotEmpty() ? $this->totals($previous, $establishment->inquiries()->whereBetween('created_at', [$from->subDays($days)->startOfDay(), $from->subDay()->endOfDay()])->get(['id', 'type', 'status'])) : null,
            'series' => collect(range(0, $days - 1))->map(function (int $offset) use ($from, $stats, $inquiries): array {
                $date = $from->addDays($offset)->toDateString();
                $day = $stats->where('date', $date);

                return [
                    'date' => $date,
                    'views' => (int) $day->where('metric', StatMetric::View->value)->sum('count'),
                    'contactClicks' => (int) $day->whereIn('metric', [StatMetric::ContactClick->value, StatMetric::WebsiteClick->value])->sum('count'),
                    'inquiries' => $inquiries->filter(fn ($inquiry) => $inquiry->created_at->toDateString() === $date)->count(),
                ];
            })->values(),
            'offers' => $offers->map(fn (Offer $offer) => [
                'id' => $offer->slug,
                'title' => $offer->title,
                'status' => $offer->status->value,
                'views' => (int) $stats->where('offer_id', $offer->id)->where('metric', StatMetric::View->value)->sum('count'),
                'contactClicks' => (int) $stats->where('offer_id', $offer->id)->whereIn('metric', [StatMetric::ContactClick->value, StatMetric::WebsiteClick->value])->sum('count'),
                'inquiries' => $inquiries->where('offer_id', $offer->id)->count(),
            ])->sortByDesc('inquiries')->values(),
        ];

        if ($level === 'advanced') {
            $data['campaigns'] = $establishment->campaigns()->with('offer')->latest('starts_on')->get()->map(function (Campaign $campaign) use ($establishment): array {
                $campaignStats = DailyStat::where('establishment_id', $establishment->id)->where('campaign_id', $campaign->id)->toBase()->get();
                $impressions = (int) $campaignStats->where('metric', StatMetric::Impression->value)->sum('count');
                $clicks = (int) $campaignStats->where('metric', StatMetric::Click->value)->sum('count');

                return [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'offer' => $campaign->offer->title,
                    'startsOn' => $campaign->starts_on->toDateString(),
                    'endsOn' => $campaign->ends_on->toDateString(),
                    'impressions' => $impressions,
                    'clicks' => $clicks,
                    'clickRate' => $impressions > 0 ? round($clicks / $impressions * 100, 1) : null,
                    // Demandes reçues pour l'offre promue pendant la campagne (attribution indicative).
                    'inquiriesDuring' => $establishment->inquiries()
                        ->where('offer_id', $campaign->offer_id)
                        ->whereBetween('created_at', [$campaign->starts_on->startOfDay(), $campaign->ends_on->endOfDay()])
                        ->count(),
                ];
            });
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Lignes brutes (date et mesure en texte) pour la période.
     *
     * @return Collection<int, object{date: string, offer_id: int, metric: string, count: int}>
     */
    private function stats(Establishment $establishment, CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        return DailyStat::where('establishment_id', $establishment->id)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->toBase()
            ->get(['date', 'offer_id', 'metric', 'count'])
            ->map(fn (object $row) => (object) [
                'date' => substr((string) $row->date, 0, 10),
                'offer_id' => (int) $row->offer_id,
                'metric' => $row->metric,
                'count' => (int) $row->count,
            ]);
    }

    /**
     * @param  Collection<int, object>  $stats
     * @return array<string, int|float|null>
     */
    private function totals(Collection $stats, Collection $inquiries): array
    {
        $sum = fn (StatMetric $metric) => (int) $stats->where('metric', $metric->value)->sum('count');
        $impressions = $sum(StatMetric::Impression);

        return [
            'views' => $sum(StatMetric::View),
            'contactClicks' => $sum(StatMetric::ContactClick),
            'websiteClicks' => $sum(StatMetric::WebsiteClick),
            'applyClicks' => $sum(StatMetric::ApplyClick),
            'impressions' => $impressions,
            'clicks' => $sum(StatMetric::Click),
            'clickRate' => $impressions > 0 ? round($sum(StatMetric::Click) / $impressions * 100, 1) : null,
            'inquiries' => $inquiries->where('type', InquiryType::Information)->count(),
            'applications' => $inquiries->where('type', InquiryType::Application)->count(),
            'processed' => $inquiries->filter(fn ($inquiry) => $inquiry->status->value !== 'new')->count(),
        ];
    }
}
