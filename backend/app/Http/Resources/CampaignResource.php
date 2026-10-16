<?php

namespace App\Http\Resources;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Campagne Premium. Nécessite `offer`, `establishment`, `targetCategory` et `targetDomain` chargés.
 *
 * @mixin Campaign
 */
class CampaignResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $today = now()->startOfDay();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'image' => $this->image,
            'callToAction' => $this->call_to_action,
            'startsOn' => $this->starts_on->toDateString(),
            'endsOn' => $this->ends_on->toDateString(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'isRunning' => $this->status->value === 'active' && $this->starts_on->lte($today) && $this->ends_on->gte($today),
            'offer' => ['id' => $this->offer->slug, 'title' => $this->offer->title],
            'establishment' => ['id' => $this->establishment->slug, 'name' => $this->establishment->name],
            'targetCategory' => $this->targetCategory?->slug,
            'targetDomain' => $this->targetDomain?->name,
            'targetCity' => $this->target_city,
        ];
    }
}
