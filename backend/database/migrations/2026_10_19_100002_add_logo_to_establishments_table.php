<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Logo de l'établissement, affiché sur sa fiche et sur les cartes d'établissement et d'offre.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->string('logo', 2048)->nullable()->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->dropColumn('logo');
        });
    }
};
