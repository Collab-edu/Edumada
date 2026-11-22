<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * « Primaire et secondaire » devient « École, collège et lycée » : au premier regard,
     * l'ancien nom ne laissait pas voir que le lycée en fait partie.
     * Un nom déjà changé dans l'administration n'est pas touché.
     */
    public function up(): void
    {
        DB::table('categories')
            ->where('slug', 'scolaire')
            ->where('label', 'Primaire et secondaire')
            ->update(['label' => 'École, collège et lycée', 'short_label' => 'École, collège et lycée', 'updated_at' => now()]);
    }

    public function down(): void
    {
        DB::table('categories')
            ->where('slug', 'scolaire')
            ->where('label', 'École, collège et lycée')
            ->update(['label' => 'Primaire et secondaire', 'short_label' => 'Primaire et secondaire', 'updated_at' => now()]);
    }
};
