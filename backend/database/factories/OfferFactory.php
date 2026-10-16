<?php

namespace Database\Factories;

use App\Enums\AdmissionLevel;
use App\Enums\AdmissionSelection;
use App\Enums\Diploma;
use App\Enums\FeesPeriod;
use App\Enums\Modality;
use App\Enums\OfferKind;
use App\Enums\OfferStatus;
use App\Enums\RegistrationStatus;
use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'Licence '.fake()->unique()->word();

        return [
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
            'establishment_id' => Establishment::factory(),
            'kind' => OfferKind::Formation,
            'title' => $title,
            'diploma' => Diploma::Licence,
            'duration_years' => 3,
            'fees' => 1500000,
            'fees_period' => FeesPeriod::Year,
            'modality' => Modality::OnSite,
            'registration_status' => RegistrationStatus::Open,
            'languages' => ['Français'],
            'admission_level' => AdmissionLevel::Bac,
            'bac_series' => [],
            'selection' => AdmissionSelection::Application,
            'status' => OfferStatus::Published,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => OfferStatus::Draft]);
    }
}
