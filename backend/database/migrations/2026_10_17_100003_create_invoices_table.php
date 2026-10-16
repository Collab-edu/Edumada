<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Factures des formules payantes. Le paiement (Mobile Money, virement…) est confirmé
     * par un administrateur, qui active alors l'abonnement.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number', 30)->unique();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->restrictOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('billing_cycle', 20);
            $table->unsignedInteger('amount');
            $table->string('status', 20)->default('pending');
            $table->string('payment_method', 30);
            $table->string('payment_reference')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->date('period_starts_on')->nullable();
            $table->date('period_ends_on')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->json('reminders_sent')->nullable()->after('grace_ends_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('reminders_sent');
        });
        Schema::dropIfExists('invoices');
    }
};
