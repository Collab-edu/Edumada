<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Formule payante choisie à l'inscription (page Tarifs), en attendant que l'établissement s'abonne.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->string('requested_plan', 20)->nullable()->after('status');
            $table->string('requested_billing_cycle', 10)->nullable()->after('requested_plan');
        });
    }

    public function down(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->dropColumn(['requested_plan', 'requested_billing_cycle']);
        });
    }
};
