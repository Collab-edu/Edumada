<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Formule Gratuit : l'offre publiée est verrouillée un an (pas de remplacement ni de changement d'identité),
 * pour empêcher de faire tourner son unique offre chaque mois. Pro et Premium ne sont pas concernés.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->foreignId('locked_offer_id')->nullable()->after('requested_billing_cycle')->constrained('offers')->nullOnDelete();
            $table->timestamp('offer_locked_at')->nullable()->after('locked_offer_id');
            $table->timestamp('offer_locked_until')->nullable()->after('offer_locked_at');
        });

        $this->setFeature(['free' => 12, 'pro' => null, 'premium' => null]);
    }

    public function down(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('locked_offer_id');
            $table->dropColumn(['offer_locked_at', 'offer_locked_until']);
        });

        $this->setFeature(null);
    }

    /**
     * @param  array<string, int|null>|null  $months  null = retirer la fonctionnalité.
     */
    private function setFeature(?array $months): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            $features = json_decode($plan->features ?? '{}', true) ?: [];
            if ($months === null) {
                unset($features['offerLockMonths']);
            } elseif (array_key_exists($plan->code, $months)) {
                $features['offerLockMonths'] = $months[$plan->code];
            } else {
                continue;
            }
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
        }
    }
};
