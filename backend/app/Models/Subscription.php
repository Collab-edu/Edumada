<?php

namespace App\Models;

use App\Enums\BillingCycle;
use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Abonnement d'un établissement à une formule, activé après confirmation du paiement.
 */
#[Fillable(['establishment_id', 'plan_id', 'status', 'billing_cycle', 'amount', 'starts_at', 'ends_at', 'grace_ends_at', 'reminders_sent'])]
class Subscription extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'billing_cycle' => BillingCycle::class,
            'amount' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'grace_ends_at' => 'datetime',
            'reminders_sent' => 'array',
        ];
    }

    /**
     * Abonnement en vigueur : actif ou en période de grâce, déjà commencé, pas encore échu.
     */
    #[Scope]
    protected function current(Builder $query): void
    {
        $query->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Grace])
            ->where('starts_at', '<=', now())
            ->where(function (Builder $query): void {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now())
                    ->orWhere('grace_ends_at', '>', now());
            });
    }

    /**
     * @return BelongsTo<Establishment, $this>
     */
    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    /**
     * @return BelongsTo<Plan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
