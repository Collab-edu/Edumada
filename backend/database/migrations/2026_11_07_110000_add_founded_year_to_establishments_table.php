<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Année de création de l'établissement, affichée sur sa fiche (« Depuis 1998 »).
     */
    public function up(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->unsignedSmallInteger('founded_year')->nullable()->after('accreditation');
        });
    }

    public function down(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->dropColumn('founded_year');
        });
    }
};
