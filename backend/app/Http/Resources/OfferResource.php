<?php

namespace App\Http\Resources;

use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Format `FormationType` du site (src/features/formations/types.ts).
 * Nécessite `establishment.category` et `domain` chargés.
 *
 * @mixin Offer
 */
class OfferResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $establishment = $this->establishment;

        return [
            'id' => $this->slug,
            'urlSlug' => $this->url_slug,
            'title' => $this->title,
            'school' => $establishment->name,
            'schoolLogo' => $establishment->logo ?? '',
            'schoolId' => $establishment->slug,
            'schoolType' => $establishment->sector?->label(),
            'city' => $establishment->city,
            'domain' => $this->domain?->name ?? '',
            'kind' => $this->kind->label(),
            'category' => $establishment->category->slug,
            'diploma' => $this->diploma?->label(),
            'durationYears' => $this->duration_years,
            'ageRange' => $this->age_min !== null && $this->age_max !== null
                ? ['min' => $this->age_min, 'max' => $this->age_max]
                : null,
            'fees' => $this->fees,
            'feesPeriod' => $this->fees_period->label(),
            'registrationFee' => $this->registration_fee,
            'registrationPeriod' => $this->registration_starts_on && $this->registration_ends_on
                ? ['start' => $this->registration_starts_on->toDateString(), 'end' => $this->registration_ends_on->toDateString()]
                : null,
            'startDate' => $this->starts_on?->toDateString(),
            'modality' => $this->modality->label(),
            'registration' => $this->registration_status->label(),
            'languages' => $this->languages ?? [],
            'admission' => [
                'level' => $this->admission_level->label(),
                'bacSeries' => $this->bac_series ?? [],
                'selection' => $this->selection->label(),
            ],
            'housing' => $this->housing->label(),
            'scholarship' => $this->scholarship->label(),
            'imageSrc' => $this->image ?? '',
            // Recherche « autour d'un lieu » : distance en km, à 0,1 près.
            'distanceKm' => $this->when(isset($this->distance_sq), fn () => round(sqrt(max(0, (float) $this->distance_sq)), 1)),
        ];
    }
}
