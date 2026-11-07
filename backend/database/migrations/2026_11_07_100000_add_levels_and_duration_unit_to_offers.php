<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enseignement supérieur : une offre est une filière proposée à plusieurs niveaux (Licence, Master…),
     * chacun avec son diplôme, sa durée et son niveau requis (`levels`).
     * Formation professionnelle : durée exprimée dans une unité libre (heures, jours, semaines, mois, ans).
     * Sélection sur concours : frais de concours (`exam_fee`).
     * Les colonnes diploma, duration_years, fees et admission_level restent le résumé utilisé par la recherche.
     */
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            // Nom du diplôme quand l'établissement choisit « Autre ».
            $table->string('diploma_other', 100)->nullable()->after('diploma');
            $table->json('levels')->nullable()->after('diploma_other');
            // Codes des diplômes de tous les niveaux (filtre « Diplôme »).
            $table->json('level_diplomas')->nullable()->after('levels');
            $table->decimal('duration_value', 6, 2)->nullable()->after('duration_years');
            $table->string('duration_unit', 10)->nullable()->after('duration_value');
            // Frais de concours (sélection « Concours ») ; vide = pas de frais.
            $table->unsignedInteger('exam_fee')->nullable()->after('application_fee');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['diploma_other', 'levels', 'level_diplomas', 'duration_value', 'duration_unit', 'exam_fee']);
        });
    }
};
