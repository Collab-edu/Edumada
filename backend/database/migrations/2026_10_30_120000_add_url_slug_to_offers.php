<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Nom de l'offre dans son adresse : /etablissements/{établissement}/{url_slug}/.
     * Unique par établissement ; le slug global reste l'identifiant de l'API.
     */
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->string('url_slug')->nullable()->after('slug');
        });

        $taken = [];

        foreach (DB::table('offers')->orderBy('id')->get(['id', 'establishment_id', 'title']) as $offer) {
            $base = Str::slug(mb_substr($offer->title, 0, 200)) ?: 'offre';
            $slug = $base;
            $suffix = 2;

            while (isset($taken[$offer->establishment_id][$slug])) {
                $slug = $base.'-'.$suffix++;
            }

            $taken[$offer->establishment_id][$slug] = true;
            DB::table('offers')->where('id', $offer->id)->update(['url_slug' => $slug]);
        }

        Schema::table('offers', function (Blueprint $table) {
            $table->unique(['establishment_id', 'url_slug']);
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropUnique(['establishment_id', 'url_slug']);
            $table->dropColumn('url_slug');
        });
    }
};
