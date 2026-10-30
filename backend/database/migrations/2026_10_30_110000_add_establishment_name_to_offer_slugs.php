<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Les liens des offres portent le nom de l'établissement. L'ancien lien est conservé
     * dans old_slug pour que les adresses déjà partagées continuent de fonctionner.
     */
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->string('old_slug')->nullable()->index()->after('slug');
        });

        $offers = DB::table('offers')
            ->join('establishments', 'establishments.id', '=', 'offers.establishment_id')
            ->orderBy('offers.id')
            ->get(['offers.id', 'offers.slug', 'offers.title', 'establishments.name']);
        $taken = $offers->pluck('slug')->flip()->all();

        foreach ($offers as $offer) {
            $base = Str::slug(mb_substr($offer->title.' '.$offer->name, 0, 200)) ?: 'element';
            $slug = $base;
            $suffix = 2;

            while (isset($taken[$slug])) {
                $slug = $base.'-'.$suffix++;
            }

            $taken[$slug] = true;
            DB::table('offers')->where('id', $offer->id)->update(['slug' => $slug, 'old_slug' => $offer->slug]);
        }
    }

    public function down(): void
    {
        DB::table('offers')->whereNotNull('old_slug')->update(['slug' => DB::raw('old_slug')]);

        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn('old_slug');
        });
    }
};
