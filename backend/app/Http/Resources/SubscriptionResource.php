<?php

namespace App\Http\Resources;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Subscription
 */
class SubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'plan' => new PlanResource($this->plan),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'billingCycle' => $this->billing_cycle->value,
            'billingCycleLabel' => $this->billing_cycle->label(),
            'amount' => $this->amount,
            'startsAt' => $this->starts_at->toIso8601String(),
            'endsAt' => $this->ends_at?->toIso8601String(),
            'graceEndsAt' => $this->grace_ends_at?->toIso8601String(),
            'establishment' => $this->whenLoaded('establishment', fn () => ['id' => $this->establishment->slug, 'name' => $this->establishment->name]),
        ];
    }
}
