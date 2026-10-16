<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\InvoiceStatus;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\PlanResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Subscription;
use App\Notifications\SubscriptionNotice;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Factures, abonnements, formules et campagnes, vus par un administrateur.
 */
class BillingController extends Controller
{
    public function invoices(Request $request): AnonymousResourceCollection
    {
        $status = $request->validate(['status' => ['nullable', Rule::enum(InvoiceStatus::class)]])['status'] ?? null;

        return InvoiceResource::collection(
            Invoice::with(['plan', 'establishment'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        );
    }

    /**
     * Paiement reçu : la facture passe à « Payée » et la formule est activée (ou prolongée).
     */
    public function confirmInvoice(Invoice $invoice): InvoiceResource
    {
        if ($invoice->status !== InvoiceStatus::Pending) {
            throw ValidationException::withMessages(['invoice' => 'Seule une facture en attente peut être confirmée.']);
        }

        $subscription = $invoice->markAsPaid();
        AuditLog::record('subscription.activated', $subscription, ['invoice' => $invoice->number, 'plan' => $subscription->plan->code->value]);

        $establishment = $subscription->establishment;
        $notice = new SubscriptionNotice($subscription, SubscriptionNotice::ACTIVATED);
        Notification::send($establishment->members, $notice);
        if ($establishment->email) {
            Notification::route('mail', $establishment->email)->notify($notice);
        }

        return new InvoiceResource($invoice->load(['plan', 'establishment']));
    }

    public function cancelInvoice(Invoice $invoice): InvoiceResource
    {
        if ($invoice->status !== InvoiceStatus::Pending) {
            throw ValidationException::withMessages(['invoice' => 'Seule une facture en attente peut être annulée.']);
        }

        $invoice->status = InvoiceStatus::Cancelled;
        $invoice->save();
        AuditLog::record('invoice.cancelled', $invoice);

        return new InvoiceResource($invoice->load(['plan', 'establishment']));
    }

    public function subscriptions(): AnonymousResourceCollection
    {
        return SubscriptionResource::collection(
            Subscription::with(['plan', 'establishment'])
                ->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Grace])
                ->orderBy('ends_at')
                ->paginate(50),
        );
    }

    /**
     * Résiliation : les fonctions payantes s'arrêtent tout de suite, la fiche reste en ligne.
     */
    public function cancelSubscription(Subscription $subscription): SubscriptionResource
    {
        $subscription->status = SubscriptionStatus::Cancelled;
        $subscription->save();
        AuditLog::record('subscription.cancelled', $subscription, ['plan' => $subscription->plan->code->value]);

        return new SubscriptionResource($subscription->load(['plan', 'establishment']));
    }

    /**
     * Prix et limites des formules : des hypothèses à ajuster après les retours des établissements.
     */
    public function updatePlan(Request $request, Plan $plan): PlanResource
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'monthlyPrice' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'yearlyPrice' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'maxPublishedOffers' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1000'],
        ]);

        $map = ['name' => 'name', 'monthlyPrice' => 'monthly_price', 'yearlyPrice' => 'yearly_price', 'maxPublishedOffers' => 'max_published_offers'];
        $attributes = [];
        foreach ($map as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        $previous = $plan->only(array_keys($attributes));
        $plan->update($attributes);
        AuditLog::record('plan.updated', $plan, ['before' => $previous, 'after' => $attributes]);

        return new PlanResource($plan);
    }

    public function campaigns(): AnonymousResourceCollection
    {
        return CampaignResource::collection(
            Campaign::with(['offer', 'establishment', 'targetCategory', 'targetDomain'])->latest('starts_on')->paginate(50),
        );
    }
}
