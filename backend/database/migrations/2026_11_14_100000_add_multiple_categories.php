<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Établissements multi-cycles (crèche → université) :
 * - une fiche garde sa catégorie principale et peut en ajouter d'autres (`category_establishment`) ;
 * - chaque offre porte sa propre catégorie (`offers.category_id`), par défaut celle de la fiche ;
 * - formule Gratuit : une seule catégorie (`maxCategories` = 1), Pro et Premium : illimité.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_establishment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['category_id', 'establishment_id']);
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('establishment_id')->constrained()->nullOnDelete();
        });

        // Les offres existantes prennent la catégorie de leur fiche.
        DB::table('offers')->update([
            'category_id' => DB::raw('(select establishments.category_id from establishments where establishments.id = offers.establishment_id)'),
        ]);

        $this->setMaxCategories(['free' => 1, 'pro' => null, 'premium' => null]);
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
        Schema::dropIfExists('category_establishment');

        foreach (DB::table('plans')->get() as $plan) {
            $features = json_decode($plan->features ?? '{}', true) ?: [];
            unset($features['maxCategories']);
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
        }
    }

    /**
     * @param  array<string, int|null>  $limits
     */
    private function setMaxCategories(array $limits): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            if (! array_key_exists($plan->code, $limits)) {
                continue;
            }
            $features = [...(json_decode($plan->features ?? '{}', true) ?: []), 'maxCategories' => $limits[$plan->code]];
            DB::table('plans')->where('id', $plan->id)->update(['features' => json_encode($features)]);
        }
    }
};
