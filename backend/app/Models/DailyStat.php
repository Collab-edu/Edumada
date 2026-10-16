<?php

namespace App\Models;

use App\Enums\StatMetric;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Compteur quotidien d'une mesure (vues, clics…) pour un établissement, une offre et une campagne.
 * `offer_id` = 0 : fiche établissement ; `campaign_id` = 0 : hors campagne.
 */
#[Fillable(['date', 'establishment_id', 'offer_id', 'campaign_id', 'metric', 'count'])]
#[WithoutTimestamps]
class DailyStat extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'metric' => StatMetric::class,
            'count' => 'integer',
        ];
    }

    /**
     * Ajoute `$count` au compteur du jour, de façon atomique.
     */
    public static function bump(int $establishmentId, ?int $offerId, ?int $campaignId, StatMetric $metric, int $count = 1): void
    {
        self::query()->upsert(
            [[
                'date' => now()->toDateString(),
                'establishment_id' => $establishmentId,
                'offer_id' => $offerId ?? 0,
                'campaign_id' => $campaignId ?? 0,
                'metric' => $metric->value,
                'count' => $count,
            ]],
            ['date', 'establishment_id', 'offer_id', 'campaign_id', 'metric'],
            ['count' => DB::raw('count + '.$count)],
        );
    }
}
