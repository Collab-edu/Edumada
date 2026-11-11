<?php

use App\Models\Domain;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Rattache chaque domaine aux catégories d'établissement qui peuvent l'utiliser et ajoute
     * les domaines de la formation professionnelle (une offre de centre de formation ne doit plus
     * proposer « Médecine & Santé » ou « Ingénierie »).
     */
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->json('categories')->nullable()->after('icon');
        });

        // Base neuve (tests, installation) : SiteDataSeeder crée les domaines avec leurs catégories.
        if (! DB::table('domains')->exists()) {
            return;
        }

        $position = (int) DB::table('domains')->max('position');
        foreach (Domain::DEFAULTS as $name => $default) {
            $categories = json_encode($default['categories']);
            if (DB::table('domains')->where('name', $name)->exists()) {
                DB::table('domains')->where('name', $name)->update(['categories' => $categories]);

                continue;
            }

            DB::table('domains')->insert([
                'slug' => Str::slug($name),
                'name' => $name,
                'icon' => $default['icon'],
                'categories' => $categories,
                'position' => ++$position,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn('categories');
        });
    }
};
