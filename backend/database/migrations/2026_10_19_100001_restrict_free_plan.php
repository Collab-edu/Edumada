<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Formule Gratuit restreinte : 1 offre publiée, pas de galerie photos, 2 infrastructures,
 * coordonnées limitées à l'adresse, au téléphone et à l'e-mail, pas d'avis.
 * Les formules payantes gardent tout.
 */
return new class extends Migration
{
    private const FEATURES = [
        'free' => ['photoGallery' => false, 'onlineLinks' => false, 'reviews' => false, 'maxInfrastructures' => 2],
        'pro' => ['photoGallery' => true, 'onlineLinks' => true, 'reviews' => true, 'maxInfrastructures' => null],
        'premium' => ['photoGallery' => true, 'onlineLinks' => true, 'reviews' => true, 'maxInfrastructures' => null],
    ];

    public function up(): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            $features = [...(json_decode($plan->features ?? '{}', true) ?: []), ...(self::FEATURES[$plan->code] ?? [])];
            $update = ['features' => json_encode($features)];
            if ($plan->code === 'free') {
                $update['max_published_offers'] = 1;
            }
            DB::table('plans')->where('id', $plan->id)->update($update);
        }
    }

    public function down(): void
    {
        foreach (DB::table('plans')->get() as $plan) {
            $features = json_decode($plan->features ?? '{}', true) ?: [];
            unset($features['photoGallery'], $features['onlineLinks'], $features['reviews'], $features['maxInfrastructures']);
            $update = ['features' => json_encode($features)];
            if ($plan->code === 'free') {
                $update['max_published_offers'] = 3;
            }
            DB::table('plans')->where('id', $plan->id)->update($update);
        }
    }
};
