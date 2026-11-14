<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Plusieurs utilisateurs par établissement (membres de l'équipe) : réservé à la formule Premium.
 * Les membres déjà ajoutés gardent leur accès ; seuls les nouveaux ajouts sont bloqués.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            $features = [...(json_decode($plan->features ?? '{}', true) ?: []), 'teamMembers' => $plan->code === 'premium'];
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
        }
    }

    public function down(): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            $features = json_decode($plan->features ?? '{}', true) ?: [];
            unset($features['teamMembers']);
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
        }
    }
};
