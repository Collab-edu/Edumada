<?php

namespace Tests\Feature\Api\V1;

use App\Enums\InvoiceStatus;
use App\Enums\OfferStatus;
use App\Enums\PlanCode;
use App\Enums\SubscriptionStatus;
use App\Models\Invoice;
use App\Models\Offer;
use App\Models\Plan;
use App\Notifications\SubscriptionNotice;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Formules payantes : demande, facture, confirmation du paiement, expiration.
 */
class BillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
        Notification::fake();
    }

    public function test_requesting_pro_creates_a_pending_invoice_with_payment_instructions(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/subscription-requests", [
            'plan' => 'pro',
            'billingCycle' => 'yearly',
            'paymentMethod' => 'mvola',
        ])->assertCreated()
            ->assertJsonPath('data.amount', 600000)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.paymentMethodLabel', 'MVola');

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/subscription-requests", [
            'plan' => 'premium', 'billingCycle' => 'monthly', 'paymentMethod' => 'cash',
        ])->assertUnprocessable()->assertJsonValidationErrors('plan');
    }

    public function test_admin_confirmation_activates_the_plan_and_notifies_the_establishment(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $invoice = $this->pendingInvoice($establishment, PlanCode::Pro);

        $this->actingAs($this->admin())->putJson("/api/v1/admin/invoices/{$invoice->id}/confirm")
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $this->assertSame(PlanCode::Pro, $establishment->currentPlan()->code);
        $this->assertDatabaseHas('audit_logs', ['action' => 'subscription.activated']);
        Notification::assertSentTo($owner, SubscriptionNotice::class, fn (SubscriptionNotice $notice) => $notice->kind === SubscriptionNotice::ACTIVATED);
    }

    public function test_paying_the_same_plan_again_extends_the_current_period(): void
    {
        [, $establishment] = $this->establishmentOwner();
        $this->subscribe($establishment, PlanCode::Pro, now()->addMonths(2));
        $endsAt = $establishment->currentSubscription()->ends_at;

        $this->pendingInvoice($establishment, PlanCode::Pro)->markAsPaid();

        $this->assertSame(1, $establishment->subscriptions()->count());
        $this->assertTrue($establishment->currentSubscription()->ends_at->equalTo($endsAt->copy()->addYear()));
    }

    public function test_establishment_cannot_confirm_its_own_invoice_403(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $invoice = $this->pendingInvoice($establishment, PlanCode::Pro);

        $this->actingAs($owner)->putJson("/api/v1/admin/invoices/{$invoice->id}/confirm")->assertForbidden();

        $this->assertSame(InvoiceStatus::Pending, $invoice->refresh()->status);
    }

    public function test_daily_processing_sends_reminders_then_grace_then_expiry(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $this->subscribe($establishment, PlanCode::Pro, now()->addDays(6));
        Offer::factory()->count(5)->for($establishment)->create();

        $this->artisan('subscriptions:process')->assertSuccessful();
        Notification::assertSentTo($owner, SubscriptionNotice::class, fn (SubscriptionNotice $notice) => $notice->kind === SubscriptionNotice::EXPIRING);

        $this->travel(7)->days();
        $this->artisan('subscriptions:process')->assertSuccessful();
        $subscription = $establishment->subscriptions()->first();
        $this->assertSame(SubscriptionStatus::Grace, $subscription->status);
        $this->assertSame(PlanCode::Pro, $establishment->currentPlan()->code);

        $this->travel(8)->days();
        $this->artisan('subscriptions:process')->assertSuccessful();
        $this->assertSame(SubscriptionStatus::Expired, $subscription->refresh()->status);
        $this->assertSame(PlanCode::Free, $establishment->currentPlan()->code);
        $this->assertSame(1, $establishment->offers()->where('status', OfferStatus::Published)->count());
        $this->assertSame(4, $establishment->offers()->where('status', OfferStatus::Draft)->count());
    }

    private function pendingInvoice($establishment, PlanCode $plan): Invoice
    {
        return $establishment->invoices()->create([
            'number' => Invoice::nextNumber(),
            'plan_id' => Plan::firstWhere('code', $plan)->id,
            'billing_cycle' => 'yearly',
            'amount' => 600000,
            'payment_method' => 'mvola',
        ]);
    }
}
