<?php

namespace App\Models;

use App\Enums\BillingCycle;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentMethod;
use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

/**
 * Facture d'une formule payante. Payée = abonnement activé par un administrateur.
 */
#[Fillable([
    'number', 'establishment_id', 'plan_id', 'requested_by', 'billing_cycle', 'amount',
    'payment_method', 'payment_reference',
])]
class Invoice extends Model
{
    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'pending',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'billing_cycle' => BillingCycle::class,
            'status' => InvoiceStatus::class,
            'payment_method' => PaymentMethod::class,
            'amount' => 'integer',
            'paid_at' => 'datetime',
            'period_starts_on' => 'date',
            'period_ends_on' => 'date',
        ];
    }

    /**
     * Numéro lisible et unique : EDU-2026-00042.
     */
    public static function nextNumber(): string
    {
        $year = now()->year;
        $count = self::whereLike('number', "EDU-{$year}-%")->count() + 1;

        do {
            $number = sprintf('EDU-%d-%05d', $year, $count++);
        } while (self::where('number', $number)->exists());

        return $number;
    }

    /**
     * Paiement confirmé : active la formule, ou prolonge l'abonnement en cours à la même formule.
     * Un changement de formule démarre aujourd'hui et remplace l'abonnement précédent.
     */
    public function markAsPaid(): Subscription
    {
        return DB::transaction(function (): Subscription {
            $establishment = $this->establishment;
            $current = $establishment->currentSubscription();
            $extends = $current && $current->plan_id === $this->plan_id && $current->ends_at;

            $startsAt = $extends ? $current->ends_at->copy() : now();
            $endsAt = $this->billing_cycle === BillingCycle::Yearly ? $startsAt->copy()->addYear() : $startsAt->copy()->addMonth();

            if ($extends) {
                $current->update(['ends_at' => $endsAt, 'status' => SubscriptionStatus::Active, 'grace_ends_at' => null, 'reminders_sent' => null]);
                $subscription = $current;
            } else {
                $current?->update(['status' => SubscriptionStatus::Cancelled]);
                $subscription = $establishment->subscriptions()->create([
                    'plan_id' => $this->plan_id,
                    'status' => SubscriptionStatus::Active,
                    'billing_cycle' => $this->billing_cycle,
                    'amount' => $this->amount,
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                ]);
            }

            $this->status = InvoiceStatus::Paid;
            $this->paid_at = now();
            $this->period_starts_on = $startsAt;
            $this->period_ends_on = $endsAt;
            $this->subscription_id = $subscription->id;

            // La formule demandée à l'inscription est maintenant active.
            if ($establishment->requested_plan === $subscription->plan->code->value) {
                $establishment->forceFill(['requested_plan' => null, 'requested_billing_cycle' => null])->save();
            }
            $this->save();

            return $subscription->load(['plan', 'establishment']);
        });
    }

    /**
     * @return BelongsTo<Establishment, $this>
     */
    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class)->withTrashed();
    }

    /**
     * @return BelongsTo<Plan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * @return BelongsTo<Subscription, $this>
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
