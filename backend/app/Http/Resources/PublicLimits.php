<?php

namespace App\Http\Resources;

use App\Models\Plan;

/**
 * Ce que la formule en vigueur permet d'afficher sur la fiche publique.
 * Les données restent enregistrées : elles réapparaissent si l'établissement passe à une formule supérieure.
 */
final class PublicLimits
{
    /**
     * @param  array<string, mixed>  $fiche  Fiche au format du site (EstablishmentResource).
     * @return array<string, mixed>
     */
    public static function apply(array $fiche, Plan $plan): array
    {
        if (! $plan->hasFeature('photoGallery')) {
            $fiche['photos'] = [];
        }
        if (! $plan->hasFeature('onlineLinks')) {
            $fiche['website'] = '';
            $fiche['socialLinks'] = (object) [];
        }
        if (($max = $plan->limit('maxInfrastructures')) !== null) {
            $fiche['infrastructures'] = array_slice($fiche['infrastructures'], 0, $max);
        }

        return $fiche;
    }
}
