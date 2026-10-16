<?php

namespace Database\Seeders;

use App\Enums\AdmissionLevel;
use App\Enums\AdmissionSelection;
use App\Enums\CostsStatus;
use App\Enums\Diploma;
use App\Enums\EstablishmentSector;
use App\Enums\EstablishmentStatus;
use App\Enums\FeesPeriod;
use App\Enums\HousingAvailability;
use App\Enums\Modality;
use App\Enums\OfferKind;
use App\Enums\OfferStatus;
use App\Enums\RegistrationStatus;
use App\Enums\ReviewStatus;
use App\Enums\ScholarshipAvailability;
use App\Enums\VerificationStatus;
use App\Models\Category;
use App\Models\Domain;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Importe les données d'exemple du site (public/data/*.json) : catégories, domaines,
 * établissements, offres et avis. Toutes ces données sont fictives.
 */
class SiteDataSeeder extends Seeder
{
    /**
     * Icônes des domaines absents des cartes de l'accueil.
     *
     * @var array<string, string>
     */
    private const EXTRA_DOMAIN_ICONS = [
        'Ingénierie' => 'tabler:settings',
        'Agronomie' => 'tabler:plant',
        'Petite enfance' => 'tabler:baby-carriage',
        'Enseignement général' => 'tabler:school',
        'Éducation spécialisée' => 'tabler:heart-handshake',
    ];

    public function run(): void
    {
        $site = $this->readJson('data.json');
        $details = collect($this->readJson('formation-details.json'))->keyBy('id');

        $categories = $this->seedCategories($site['CategoryData']);
        $domains = $this->seedDomains($site);
        $establishments = $this->seedEstablishments($site['SchoolData'], $categories);
        $offers = $this->seedOffers($site['FormationData'], $details->all(), $establishments, $domains);
        $this->seedReviews($site['TestimonialData'], $establishments, $offers);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @return array<string, Category>
     */
    private function seedCategories(array $items): array
    {
        $categories = [];

        foreach ($items as $position => $item) {
            $category = Category::updateOrCreate(['slug' => $item['id']], [
                'label' => $item['label'],
                'short_label' => $item['shortLabel'],
                'icon' => $item['icon'],
                'offers_label' => $item['offersLabel'],
                'fields' => $item['fields'],
                'position' => $position,
            ]);

            foreach ($item['subCategories'] as $subPosition => $label) {
                $category->subCategories()->updateOrCreate(['label' => $label], ['position' => $subPosition]);
            }

            $categories[$item['id']] = $category;
        }

        return $categories;
    }

    /**
     * Les domaines sont les options du filtre « Domaine d'études » ; l'icône vient des cartes de l'accueil.
     *
     * @param  array<string, mixed>  $site
     * @return array<string, Domain>
     */
    private function seedDomains(array $site): array
    {
        $filter = collect($site['HeroFilterData'])->firstWhere('param', 'domaine');
        $names = array_values(array_filter($filter['options'], fn (string $option) => $option !== 'Tous les domaines'));
        $icons = collect($site['DomainData'])->groupBy('searchDomain')->map(fn ($cards) => $cards->first()['icon']);

        $domains = [];
        foreach ($names as $position => $name) {
            $domains[$name] = Domain::updateOrCreate(['name' => $name], [
                'slug' => Str::slug($name),
                'icon' => $icons[$name] ?? self::EXTRA_DOMAIN_ICONS[$name] ?? null,
                'position' => $position,
            ]);
        }

        return $domains;
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @param  array<string, Category>  $categories
     * @return array<string, Establishment>
     */
    private function seedEstablishments(array $items, array $categories): array
    {
        $establishments = [];

        foreach ($items as $item) {
            $category = $categories[$item['category']];

            $establishment = Establishment::withTrashed()->firstOrNew(['slug' => $item['id']]);
            $establishment->fill([
                'name' => $item['name'],
                'initials' => $item['initials'],
                'sector' => EstablishmentSector::fromLabel($item['type']),
                'category_id' => $category->id,
                'sub_category_id' => $category->subCategories()->firstOrCreate(['label' => $item['subCategory']])->id,
                'city' => $item['city'],
                'address' => $item['address'],
                'phone' => $item['phone'],
                'email' => $item['email'],
                'website' => $item['website'],
                'description' => $item['description'],
                'social_links' => $item['socialLinks'],
                'infrastructures' => $item['infrastructures'],
                'accreditation' => $item['accreditation'],
                'latitude' => $item['coordinates']['lat'],
                'longitude' => $item['coordinates']['lng'],
                'admission_documents' => $item['admissionDocuments'],
                'cover_image' => $item['imageSrc'],
                'photos' => $item['photos'],
            ]);
            $establishment->status = EstablishmentStatus::Published;
            $establishment->verification_status = VerificationStatus::fromLabel($item['verification']['status']);
            $establishment->verified_at = $item['verification']['date'];
            $establishment->accreditation_verified = $item['accreditationVerified'];
            $establishment->deleted_at = null;
            $establishment->save();

            $establishments[$item['id']] = $establishment;
        }

        return $establishments;
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @param  array<string, array<string, mixed>>  $details
     * @param  array<string, Establishment>  $establishments
     * @param  array<string, Domain>  $domains
     * @return array<string, Offer>
     */
    private function seedOffers(array $items, array $details, array $establishments, array $domains): array
    {
        $offers = [];

        foreach ($items as $item) {
            $detail = $details[$item['id']] ?? [];

            $offer = Offer::withTrashed()->firstOrNew(['slug' => $item['id']]);
            $offer->establishment_id = $establishments[$item['schoolId']]->id;
            $offer->fill([
                'domain_id' => $domains[$item['domain']]->id ?? null,
                'kind' => OfferKind::fromLabel($item['kind']),
                'title' => $item['title'],
                'diploma' => Diploma::fromNullableLabel($item['diploma']),
                'duration_years' => $item['durationYears'],
                'age_min' => $item['ageRange']['min'] ?? null,
                'age_max' => $item['ageRange']['max'] ?? null,
                'fees' => $item['fees'],
                'fees_period' => FeesPeriod::fromLabel($item['feesPeriod']),
                'registration_fee' => $item['registrationFee'],
                'registration_starts_on' => $item['registrationPeriod']['start'] ?? null,
                'registration_ends_on' => $item['registrationPeriod']['end'] ?? null,
                'starts_on' => $item['startDate'],
                'modality' => Modality::fromLabel($item['modality']),
                'registration_status' => RegistrationStatus::fromLabel($item['registration']),
                'languages' => $item['languages'],
                'admission_level' => AdmissionLevel::fromLabel($item['admission']['level']),
                'bac_series' => $item['admission']['bacSeries'],
                'selection' => AdmissionSelection::fromLabel($item['admission']['selection']),
                'housing' => HousingAvailability::fromLabel($item['housing']),
                'scholarship' => ScholarshipAvailability::fromLabel($item['scholarship']),
                'image' => $item['imageSrc'],
                'status' => OfferStatus::Published,
                'description' => $detail['description'] ?? null,
                'objectives' => $detail['objectives'] ?? [],
                'skills' => $detail['skills'] ?? [],
                'subjects' => $detail['subjects'] ?? [],
                'program' => $detail['program'] ?? [],
                'specializations' => $detail['specializations'] ?? [],
                'teaching_methods' => $detail['teachingMethods'] ?? [],
                'evaluation' => $detail['evaluation'] ?? null,
                'prerequisites' => $detail['admission']['prerequisites'] ?? [],
                'special_conditions' => $detail['admission']['specialConditions'] ?? null,
                'min_age' => $detail['admission']['minAge'] ?? null,
                'application_fee' => $detail['costs']['applicationFee'] ?? null,
                'other_fees' => $detail['costs']['otherFees'] ?? [],
                'costs_status' => CostsStatus::fromLabel($detail['costs']['status'] ?? CostsStatus::Undisclosed->label()),
                'payment_options' => $detail['costs']['paymentOptions'] ?? [],
                'scholarships_info' => $detail['costs']['scholarships'] ?? null,
                'discounts' => $detail['costs']['discounts'] ?? null,
                'schedule' => $detail['organization']['schedule'] ?? null,
                'campus' => $detail['organization']['campus'] ?? null,
                'rhythm' => $detail['organization']['rhythm'] ?? [],
                'jobs' => $detail['careers']['jobs'] ?? [],
                'sectors' => $detail['careers']['sectors'] ?? [],
                'further_studies' => $detail['careers']['furtherStudies'] ?? [],
                'internship' => $detail['careers']['internship'] ?? null,
                'partnerships' => $detail['careers']['partnerships'] ?? [],
                'online_application' => $detail['onlineApplication'] ?? false,
                'brochure_url' => $detail['brochureUrl'] ?? null,
                'academic_calendar' => $detail['academicCalendar'] ?? [],
                'last_verified_at' => $detail['lastVerified'] ?? null,
            ]);
            $offer->deleted_at = null;
            $offer->save();

            $offers[$item['id']] = $offer;
        }

        return $offers;
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @param  array<string, Establishment>  $establishments
     * @param  array<string, Offer>  $offers
     */
    private function seedReviews(array $items, array $establishments, array $offers): void
    {
        Review::query()->delete();

        foreach ($items as $item) {
            $review = new Review([
                'establishment_id' => $establishments[$item['schoolId']]->id,
                'offer_id' => isset($offers[$item['formationId']]) ? $offers[$item['formationId']]->id : null,
                'author_name' => $item['name'],
                'author_status' => $item['status'],
                'rating' => $item['rating'],
                'quote' => $item['quote'],
            ]);
            $review->status = ReviewStatus::Published;
            $review->save();
        }
    }

    /**
     * @return array<mixed>
     */
    private function readJson(string $file): array
    {
        $path = rtrim(config('edumada.site_data_path'), '/\\').DIRECTORY_SEPARATOR.$file;

        if (! is_file($path)) {
            throw new RuntimeException("Fichier de données du site introuvable : {$path} (voir EDUMADA_SITE_DATA_PATH).");
        }

        return json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }
}
