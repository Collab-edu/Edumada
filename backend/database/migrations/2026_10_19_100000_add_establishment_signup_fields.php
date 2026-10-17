<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inscription d'un établissement : identité du responsable du compte, et fiche
 * créée sans secteur (public / privé), précisé ensuite dans le back-office.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('job_title')->nullable()->after('last_name');
        });

        Schema::table('establishments', function (Blueprint $table) {
            $table->string('sector', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'job_title']);
        });

        Schema::table('establishments', function (Blueprint $table) {
            $table->string('sector', 20)->nullable(false)->change();
        });
    }
};
