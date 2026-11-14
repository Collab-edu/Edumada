<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Avis des étudiants réservés à la formule Premium (auparavant Pro et Premium).
 * Les avis déjà publiés restent enregistrés et réapparaissent si l'établissement passe à Premium.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->setReviews(['free' => false, 'pro' => false, 'premium' => true]);
    }

    public function down(): void
    {
        $this->setReviews(['free' => false, 'pro' => true, 'premium' => true]);
    }

    /**
     * @param  array<string, bool>  $reviews
     */
    private function setReviews(array $reviews): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            if (! array_key_exists($plan->code, $reviews)) {
                continue;
            }
            $features = [...(json_decode($plan->features ?? '{}', true) ?: []), 'reviews' => $reviews[$plan->code]];
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
        }
    }
};
