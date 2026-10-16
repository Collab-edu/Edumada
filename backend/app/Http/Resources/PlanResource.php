<?php

namespace App\Http\Resources;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Plan
 */
class PlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code->value,
            'name' => $this->name,
            'monthlyPrice' => $this->monthly_price,
            'yearlyPrice' => $this->yearly_price,
            'maxPublishedOffers' => $this->max_published_offers,
            'features' => (object) $this->features,
        ];
    }
}
