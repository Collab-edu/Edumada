<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Domaine « Autre » pour une formation professionnelle qui n'entre dans aucun domaine de la liste ;
     * placé en dernier dans les listes.
     */
    public function up(): void
    {
        // Base neuve (tests, installation) : SiteDataSeeder crée les domaines avec leurs catégories.
        if (! DB::table('domains')->exists() || DB::table('domains')->where('name', 'Autre')->exists()) {
            return;
        }

        DB::table('domains')->insert([
            'slug' => 'autre',
            'name' => 'Autre',
            'icon' => 'tabler:dots',
            'categories' => json_encode(['formation-pro', 'autres']),
            'position' => 999,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('domains')->where('name', 'Autre')->delete();
    }
};
