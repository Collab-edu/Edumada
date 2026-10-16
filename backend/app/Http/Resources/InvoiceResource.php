<?php

namespace App\Http\Resources;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Facture d'une formule payante. Nécessite `plan` et `establishment` chargés.
 *
 * @mixin Invoice
 */
class InvoiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'establishment' => [
                'id' => $this->establishment->slug,
                'name' => $this->establishment->name,
                'address' => $this->establishment->address,
                'city' => $this->establishment->city,
                'email' => $this->establishment->email,
            ],
            'plan' => ['code' => $this->plan->code->value, 'name' => $this->plan->name],
            'billingCycle' => $this->billing_cycle->value,
            'billingCycleLabel' => $this->billing_cycle->label(),
            'amount' => $this->amount,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'paymentMethod' => $this->payment_method->value,
            'paymentMethodLabel' => $this->payment_method->label(),
            'paymentInstructions' => config('edumada.payment_instructions.'.$this->payment_method->value),
            'paymentReference' => $this->payment_reference,
            'paidAt' => $this->paid_at?->toIso8601String(),
            'periodStartsOn' => $this->period_starts_on?->toDateString(),
            'periodEndsOn' => $this->period_ends_on?->toDateString(),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
