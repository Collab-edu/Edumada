<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enseignement supérieur : une offre est une filière proposée à plusieurs niveaux (Licence, Master…),
     * chacun avec son diplôme, sa durée, ses frais et son niveau requis (`levels`).
     * Formation professionnelle : durée exprimée dans une unité libre (heures, jours, semaines, mois, ans).
     * Les colonnes diploma, duration_years, fees et admission_level restent le résumé utilisé par la recherche.
     */
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->json('levels')->nullable()->after('diploma');
            // Codes des diplômes de tous les niveaux (filtre « Diplôme »).
            $table->json('level_diplomas')->nullable()->after('levels');
            $table->decimal('duration_value', 6, 2)->nullable()->after('duration_years');
            $table->string('duration_unit', 10)->nullable()->after('duration_value');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['levels', 'level_diplomas', 'duration_value', 'duration_unit']);
        });
    }
};
