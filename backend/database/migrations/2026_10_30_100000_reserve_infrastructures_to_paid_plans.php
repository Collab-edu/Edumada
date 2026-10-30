<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Infrastructures réservées aux formules payantes : plus aucune sur la formule Gratuit.
 * Les données restent enregistrées et réapparaissent au passage à une formule supérieure.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->setFreeLimit(0);
    }

    public function down(): void
    {
        $this->setFreeLimit(2);
    }

    private function setFreeLimit(int $max): void
    {
        $plan = DB::table('plans')->where('code', 'free')->first();
        if ($plan === null) {
            return;
        }

        $features = [...(json_decode($plan->features ?? '{}', true) ?: []), 'maxInfrastructures' => $max];
        DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
    }
};
