<?php

namespace App\Models;

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
use App\Enums\ScholarshipAvailability;
use App\Models\Concerns\HasUniqueSlug;
use Database\Factories\OfferFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Offre éducative : formation, niveau scolaire ou accueil.
 */
#[Fillable([
    'slug', 'domain_id', 'kind', 'title', 'diploma', 'duration_years', 'age_min', 'age_max',
    'fees', 'fees_period', 'registration_fee', 'registration_starts_on', 'registration_ends_on',
    'starts_on', 'modality', 'registration_status', 'languages', 'admission_level', 'bac_series',
    'selection', 'housing', 'scholarship', 'image', 'status',
    'description', 'objectives', 'skills', 'subjects', 'program', 'specializations',
    'teaching_methods', 'evaluation', 'prerequisites', 'special_conditions', 'min_age',
    'application_fee', 'other_fees', 'costs_status', 'payment_options', 'scholarships_info',
    'discounts', 'schedule', 'campus', 'rhythm', 'jobs', 'sectors', 'further_studies',
    'internship', 'partnerships', 'online_application', 'brochure_url', 'academic_calendar',
    'last_verified_at',
])]
#[RouteKey('slug')]
class Offer extends Model
{
    /** @use HasFactory<OfferFactory> */
    use HasFactory, HasUniqueSlug, SoftDeletes;

    /**
     * Valeurs par défaut de la base, nécessaires pour renvoyer une offre juste créée.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'fees_period' => 'an',
        'admission_level' => 'none',
        'housing' => 'unknown',
        'scholarship' => 'unknown',
        'costs_status' => 'undisclosed',
        'status' => 'draft',
        'online_application' => false,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => OfferKind::class,
            'diploma' => Diploma::class,
            'fees_period' => FeesPeriod::class,
            'modality' => Modality::class,
            'registration_status' => RegistrationStatus::class,
            'admission_level' => AdmissionLevel::class,
            'selection' => AdmissionSelection::class,
            'housing' => HousingAvailability::class,
            'scholarship' => ScholarshipAvailability::class,
            'costs_status' => CostsStatus::class,
            'status' => OfferStatus::class,
            'duration_years' => 'float',
            'age_min' => 'float',
            'age_max' => 'float',
            'min_age' => 'float',
            'fees' => 'integer',
            'registration_fee' => 'integer',
            'application_fee' => 'integer',
            'registration_starts_on' => 'date',
            'registration_ends_on' => 'date',
            'starts_on' => 'date',
            'last_verified_at' => 'date',
            'online_application' => 'boolean',
            'languages' => 'array',
            'bac_series' => 'array',
            'objectives' => 'array',
            'skills' => 'array',
            'subjects' => 'array',
            'program' => 'array',
            'specializations' => 'array',
            'teaching_methods' => 'array',
            'prerequisites' => 'array',
            'other_fees' => 'array',
            'payment_options' => 'array',
            'rhythm' => 'array',
            'jobs' => 'array',
            'sectors' => 'array',
            'further_studies' => 'array',
            'partnerships' => 'array',
            'academic_calendar' => 'array',
        ];
    }

    /**
     * Offres visibles par le public : publiées, dans un établissement publié.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', OfferStatus::Published)
            ->whereHas('establishment', fn (Builder $establishment) => $establishment->where('status', EstablishmentStatus::Published));
    }

    /**
     * Filtres et tri de la page /recherche (voir OfferSearchRequest). Valeurs = libellés du site.
     *
     * @param  Builder<self>  $query
     * @param  array<string, mixed>  $filters
     */
    #[Scope]
    protected function matchingSearch(Builder $query, array $filters): void
    {
        $toValues = fn (string $enum, array $labels) => array_map(fn (string $label) => $enum::fromLabel($label)->value, $labels);

        $query
            ->when($filters['q'] ?? null, fn (Builder $query, string $text) => $query->where(
                fn (Builder $query) => $query->whereContains('title', $text)
                    ->orWhereHas('domain', fn (Builder $domain) => $domain->whereContains('name', $text)),
            ))
            ->when($filters['domain'] ?? null, fn (Builder $query, string $name) => $query->whereHas(
                'domain', fn (Builder $domain) => $domain->where('name', $name),
            ))
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->whereHas(
                'establishment.category', fn (Builder $categories) => $categories->where('slug', $category)->orWhere('short_label', $category),
            ))
            ->when(
                array_filter(array_intersect_key($filters, array_flip(['city', 'type', 'school']))),
                fn (Builder $query, array $establishmentFilters) => $query->whereHas('establishment', function (Builder $establishment) use ($establishmentFilters): void {
                    $establishment
                        ->when($establishmentFilters['city'] ?? null, fn (Builder $q, string $city) => $q->where('city', $city))
                        ->when($establishmentFilters['type'] ?? null, fn (Builder $q, string $type) => $q->where('sector', EstablishmentSector::fromLabel($type)))
                        ->when($establishmentFilters['school'] ?? null, fn (Builder $q, string $name) => $q->whereContains('name', $name));
                }),
            )
            ->when($filters['kind'] ?? null, fn (Builder $query, string $kind) => $query->where('kind', OfferKind::fromLabel($kind)))
            ->when(isset($filters['feesMin']), fn (Builder $query) => $query->where('fees', '>=', $filters['feesMin']))
            ->when(isset($filters['feesMax']), fn (Builder $query) => $query->where('fees', '<', $filters['feesMax']))
            ->when(isset($filters['durationMin']), fn (Builder $query) => $query->where('duration_years', '>=', $filters['durationMin']))
            ->when(isset($filters['durationMax']), fn (Builder $query) => $query->where('duration_years', '<=', $filters['durationMax']))
            ->when($filters['modalities'] ?? null, fn (Builder $query, array $labels) => $query->whereIn('modality', $toValues(Modality::class, $labels)))
            ->when($filters['diplomas'] ?? null, fn (Builder $query, array $labels) => $query->whereIn('diploma', $toValues(Diploma::class, $labels)))
            ->when($filters['housing'] ?? null, fn (Builder $query, array $labels) => $query->whereIn('housing', $toValues(HousingAvailability::class, $labels)))
            ->when($filters['scholarships'] ?? null, fn (Builder $query, array $labels) => $query->whereIn('scholarship', $toValues(ScholarshipAvailability::class, $labels)))
            ->when($filters['registration'] ?? null, fn (Builder $query, string $label) => $query->where('registration_status', RegistrationStatus::fromLabel($label)))
            ->when($filters['ids'] ?? null, fn (Builder $query, array $slugs) => $query->whereIn('slug', $slugs))
            ->when($filters['feeRanges'] ?? null, fn (Builder $query, array $ranges) => $query->where(function (Builder $query) use ($ranges): void {
                // « min-max » ou « min- » (sans plafond) ; plusieurs tranches se combinent en « OU ».
                foreach ($ranges as $range) {
                    [$min, $max] = explode('-', $range) + [1 => ''];
                    $query->orWhere(fn (Builder $query) => $query
                        ->where('fees', '>=', (int) $min)
                        ->when($max !== '', fn (Builder $query) => $query->where('fees', '<', (int) $max)));
                }
            }))
            ->when($filters['durations'] ?? null, fn (Builder $query, array $durations) => $query->where(function (Builder $query) use ($durations): void {
                foreach ($durations as $duration) {
                    match ($duration) {
                        "Moins d'un an" => $query->orWhere('duration_years', '<', 1),
                        '5 ans ou plus' => $query->orWhere('duration_years', '>=', 5),
                        default => $query->orWhere('duration_years', (int) $duration),
                    };
                }
            }))
            ->when($filters['languages'] ?? null, fn (Builder $query, array $languages) => $query->where(function (Builder $query) use ($languages): void {
                foreach ($languages as $language) {
                    if ($language === 'Autre') {
                        $query->orWhere(fn (Builder $query) => self::whereHasOtherLanguage($query));
                    } else {
                        $query->orWhereJsonContains('languages', $language);
                    }
                }
            }))
            ->when($filters['level'] ?? null, function (Builder $query, string $studentLevel): void {
                $rank = array_search($studentLevel, ['Sans BAC', 'BAC', 'BAC+2', 'BAC+3'], true);
                $query->whereIn('admission_level', array_column(array_slice(AdmissionLevel::cases(), 0, $rank + 1), 'value'));
            })
            ->when($filters['bacSeries'] ?? null, fn (Builder $query, array $series) => $query->where(function (Builder $query) use ($series): void {
                $query->whereNull('bac_series')->orWhereJsonLength('bac_series', 0);
                foreach ($series as $serie) {
                    $query->orWhereJsonContains('bac_series', $serie);
                }
            }))
            ->when(isset($filters['childAge']), fn (Builder $query) => $query
                ->where('age_min', '<=', $filters['childAge'])
                ->where('age_max', '>=', $filters['childAge']));

        // Les offres sans frais ou sans durée renseignés passent toujours en dernier.
        match ($filters['sort'] ?? 'pertinence') {
            'frais-asc' => $query->orderByRaw('fees is null')->orderBy('fees'),
            'frais-desc' => $query->orderByRaw('fees is null')->orderByDesc('fees'),
            'duree-asc' => $query->orderByRaw('duration_years is null')->orderBy('duration_years'),
            default => $query->orderBy('id'),
        };
    }

    /**
     * Offres enseignées dans au moins une langue hors Français, Malgache et Anglais.
     *
     * @param  Builder<self>  $query
     */
    private static function whereHasOtherLanguage(Builder $query): void
    {
        $known = ['Français', 'Malgache', 'Anglais'];

        $driver = $query->getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $query->whereRaw('exists (select 1 from json_each(offers.languages) where value not in (?, ?, ?))', $known);

            return;
        }

        if ($driver === 'pgsql') {
            $query->whereRaw('exists (select 1 from json_array_elements_text(offers.languages::json) as language(value) where language.value not in (?, ?, ?))', $known);

            return;
        }

        // MySQL / MariaDB : plus de langues que de langues connues trouvées.
        $query->whereRaw(
            'json_length(languages) > (json_contains(languages, ?) + json_contains(languages, ?) + json_contains(languages, ?))',
            array_map(fn (string $language) => json_encode($language), $known),
        );
    }

    public function isPubliclyVisible(): bool
    {
        return $this->status === OfferStatus::Published
            && $this->establishment->status === EstablishmentStatus::Published;
    }

    /**
     * @return BelongsTo<Establishment, $this>
     */
    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    /**
     * @return BelongsTo<Domain, $this>
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    /**
     * @return HasMany<Inquiry, $this>
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    /**
     * @return HasMany<Campaign, $this>
     */
    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    /**
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
