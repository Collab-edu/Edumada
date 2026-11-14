<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Formule Premium : plus de campagnes « Sponsorisé » ; à la place, mise en avant dans les résultats de recherche
 * (searchPriority), badge doré (premiumBadge) et promotion sur le site et les réseaux sociaux Edumada (edumadaPromotion).
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->update(fn (string $code, array $features) => [
            ...$features,
            'sponsoredPlacement' => false,
            'searchPriority' => $code === 'premium',
            'premiumBadge' => $code === 'premium',
            'edumadaPromotion' => $code === 'premium',
        ]);
    }

    public function down(): void
    {
        $this->update(function (string $code, array $features) {
            unset($features['searchPriority'], $features['premiumBadge'], $features['edumadaPromotion']);

            return [...$features, 'sponsoredPlacement' => $code === 'premium'];
        });
    }

    /**
     * @param  callable(string, array<string, mixed>): array<string, mixed>  $change
     */
    private function update(callable $change): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            $features = json_decode($plan->features ?? '{}', true) ?: [];
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($change($plan->code, $features))]);
        }
    }
};
