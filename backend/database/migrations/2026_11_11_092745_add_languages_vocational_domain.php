<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Domaine « Langues » pour les centres de formation professionnelle (anglais, français, chinois…),
     * distinct de « Lettres & Langues » du supérieur.
     */
    public function up(): void
    {
        // Base neuve (tests, installation) : SiteDataSeeder crée les domaines avec leurs catégories.
        if (! DB::table('domains')->exists() || DB::table('domains')->where('name', 'Langues')->exists()) {
            return;
        }

        DB::table('domains')->insert([
            'slug' => 'langues',
            'name' => 'Langues',
            'icon' => 'tabler:language',
            'categories' => json_encode(['formation-pro', 'autres']),
            'position' => (int) DB::table('domains')->max('position') + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('domains')->where('name', 'Langues')->delete();
    }
};
