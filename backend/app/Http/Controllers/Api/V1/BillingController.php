<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BillingCycle;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentMethod;
use App\Enums\PlanCode;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\PlanResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Models\Invoice;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Formule et factures d'un établissement. Le paiement se fait hors ligne (Mobile Money, virement…) :
 * l'établissement demande une formule, règle la facture, indique la référence du paiement ;
 * un administrateur confirme et la formule est activée.
 */
class BillingController extends Controller
{
    public function show(Establishment $establishment): JsonResponse
    {
        Gate::authorize('update', $establishment);

        $subscription = $establishment->currentSubscription();

        return response()->json(['data' => [
            'plan' => new PlanResource($establishment->currentPlan()),
            'subscription' => $subscription ? new SubscriptionResource($subscription) : null,
            'plans' => PlanResource::collection(Plan::orderBy('position')->get()),
            'publishedOffersCount' => $establishment->publishedOffers()->count(),
            'invoices' => InvoiceResource::collection($establishment->invoices()->with(['plan', 'establishment'])->latest()->limit(24)->get()),
            'paymentMethods' => array_map(fn (PaymentMethod $method) => [
                'value' => $method->value,
                'label' => $method->label(),
                'instructions' => config('edumada.payment_instructions.'.$method->value),
            ], PaymentMethod::cases()),
        ]]);
    }

    /**
     * Demande de formule payante : crée une facture en attente de paiement.
     */
    public function store(Request $request, Establishment $establishment): InvoiceResource
    {
        Gate::authorize('update', $establishment);

        $validated = $request->validate([
            'plan' => ['required', Rule::in([PlanCode::Pro->value, PlanCode::Premium->value])],
            'billingCycle' => ['required', Rule::in([BillingCycle::Monthly->value, BillingCycle::Yearly->value])],
            'paymentMethod' => ['required', Rule::enum(PaymentMethod::class)],
        ]);

        $plan = Plan::where('code', $validated['plan'])->firstOrFail();
        $amount = $validated['billingCycle'] === BillingCycle::Yearly->value ? $plan->yearly_price : $plan->monthly_price;

        if ($amount === null) {
            throw ValidationException::withMessages(['billingCycle' => "La formule {$plan->name} n'est pas proposée avec ce rythme de paiement."]);
        }
        if ($establishment->invoices()->where('status', InvoiceStatus::Pending)->exists()) {
            throw ValidationException::withMessages(['plan' => 'Une facture est déjà en attente de paiement. Réglez-la ou annulez-la avant d\'en demander une autre.']);
        }

        $invoice = $establishment->invoices()->create([
            'number' => Invoice::nextNumber(),
            'plan_id' => $plan->id,
            'requested_by' => $request->user()->id,
            'billing_cycle' => $validated['billingCycle'],
            'amount' => $amount,
            'payment_method' => $validated['paymentMethod'],
        ]);
        AuditLog::record('subscription.requested', $invoice, ['plan' => $plan->code->value, 'amount' => $amount]);

        return new InvoiceResource($invoice->load(['plan', 'establishment']));
    }

    public function showInvoice(Invoice $invoice): InvoiceResource
    {
        Gate::authorize('update', $invoice->establishment);

        return new InvoiceResource($invoice->load(['plan', 'establishment']));
    }

    /**
     * L'établissement indique la référence de son paiement, ou annule une facture en attente.
     */
    public function updateInvoice(Request $request, Invoice $invoice): InvoiceResource
    {
        Gate::authorize('update', $invoice->establishment);

        if ($invoice->status !== InvoiceStatus::Pending) {
            throw ValidationException::withMessages(['invoice' => 'Cette facture n\'est plus modifiable.']);
        }

        $validated = $request->validate([
            'paymentReference' => ['required_without:cancel', 'nullable', 'string', 'max:100'],
            'cancel' => ['sometimes', 'accepted'],
        ]);

        if ($request->boolean('cancel')) {
            $invoice->status = InvoiceStatus::Cancelled;
            AuditLog::record('invoice.cancelled', $invoice);
        } else {
            $invoice->payment_reference = $validated['paymentReference'];
        }
        $invoice->save();

        return new InvoiceResource($invoice->load(['plan', 'establishment']));
    }
}
