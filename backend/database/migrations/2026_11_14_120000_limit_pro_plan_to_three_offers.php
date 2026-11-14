<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Offres publiées par formule : Gratuit 1, Pro 3, Premium illimité.
 * Les offres déjà publiées au-delà de la limite restent en ligne ; seules les nouvelles publications sont bloquées.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('plans')->where('code', 'pro')->update(['max_published_offers' => 3]);
    }

    public function down(): void
    {
        DB::table('plans')->where('code', 'pro')->update(['max_published_offers' => null]);
    }
};
