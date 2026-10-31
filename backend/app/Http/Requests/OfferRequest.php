<?php

namespace App\Http\Requests;

use App\Enums\AdmissionLevel;
use App\Enums\AdmissionSelection;
use App\Enums\CostsStatus;
use App\Enums\Diploma;
use App\Enums\FeesPeriod;
use App\Enums\HousingAvailability;
use App\Enums\Modality;
use App\Enums\OfferKind;
use App\Enums\OfferStatus;
use App\Enums\RegistrationStatus;
use App\Enums\ScholarshipAvailability;
use App\Models\Domain;
use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Création (POST) ou modification partielle (PATCH) d'une offre, au format `FormationType`
 * du site, avec le contenu détaillé (`FormationDetailType`) dans `details`.
 * `status` (draft | published | archived) est soumis à la limite d'offres publiées de la formule.
 */
class OfferRequest extends FormRequest
{
    /**
     * Droits vérifiés avant la validation : un compte non autorisé reçoit 403, pas des erreurs de champs.
     */
    public function authorize(): bool
    {
        $offer = $this->route('offer');

        return $offer instanceof Offer
            ? $this->user()->can('update', $offer)
            : $this->user()->can('create', [Offer::class, $this->route('establishment')]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';
        $strings = fn (int $max = 255) => ['string', 'max:'.$max];

        return [
            'title' => [$required, 'string', 'max:255'],
            'domain' => ['sometimes', 'nullable', 'string', Rule::exists('domains', 'name')],
            'kind' => [$required, Rule::in(OfferKind::labels())],
            'diploma' => ['sometimes', 'nullable', Rule::in(Diploma::labels())],
            'durationYears' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:15'],
            'ageRange' => ['sometimes', 'nullable', 'array:min,max'],
            'ageRange.min' => ['required_with:ageRange', 'numeric', 'min:0', 'max:99'],
            'ageRange.max' => ['required_with:ageRange', 'numeric', 'gte:ageRange.min', 'max:99'],
            'fees' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'feesPeriod' => ['sometimes', Rule::in(FeesPeriod::labels())],
            'registrationFee' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'registrationPeriod' => ['sometimes', 'nullable', 'array:start,end'],
            'registrationPeriod.start' => ['required_with:registrationPeriod', 'date'],
            'registrationPeriod.end' => ['required_with:registrationPeriod', 'date', 'after_or_equal:registrationPeriod.start'],
            'startDate' => ['sometimes', 'nullable', 'date'],
            'modality' => [$required, Rule::in(Modality::labels())],
            'registration' => [$required, Rule::in(RegistrationStatus::labels())],
            'languages' => ['sometimes', 'array', 'max:10'],
            'languages.*' => $strings(50),
            'admission' => [$required, 'array:level,bacSeries,selection'],
            'admission.level' => ['required_with:admission', Rule::in(AdmissionLevel::labels())],
            'admission.bacSeries' => ['sometimes', 'array'],
            'admission.bacSeries.*' => $strings(30),
            'admission.selection' => ['required_with:admission', Rule::in(AdmissionSelection::labels())],
            'housing' => ['sometimes', Rule::in(HousingAvailability::labels())],
            'scholarship' => ['sometimes', Rule::in(ScholarshipAvailability::labels())],
            'imageSrc' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'status' => ['sometimes', Rule::enum(OfferStatus::class)],

            'details' => ['sometimes', 'array'],
            'details.description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'details.objectives' => ['sometimes', 'array'],
            'details.objectives.*' => $strings(),
            'details.skills' => ['sometimes', 'array'],
            'details.skills.*' => $strings(),
            'details.subjects' => ['sometimes', 'array'],
            'details.subjects.*' => $strings(),
            'details.program' => ['sometimes', 'array'],
            'details.program.*.period' => ['required', 'string', 'max:100'],
            'details.program.*.courses' => ['present', 'array'],
            'details.program.*.courses.*' => $strings(),
            'details.specializations' => ['sometimes', 'array'],
            'details.specializations.*' => $strings(),
            'details.teachingMethods' => ['sometimes', 'array'],
            'details.teachingMethods.*' => $strings(),
            'details.evaluation' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'details.admission' => ['sometimes', 'array:prerequisites,specialConditions,minAge'],
            'details.admission.prerequisites' => ['sometimes', 'array'],
            'details.admission.prerequisites.*' => $strings(),
            'details.admission.specialConditions' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'details.admission.minAge' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99'],
            'details.costs' => ['sometimes', 'array:applicationFee,otherFees,status,paymentOptions,scholarships,discounts'],
            'details.costs.applicationFee' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'details.costs.otherFees' => ['sometimes', 'array'],
            'details.costs.otherFees.*.label' => ['required', 'string', 'max:255'],
            'details.costs.otherFees.*.amount' => ['present', 'nullable', 'integer', 'min:0'],
            'details.costs.status' => ['sometimes', Rule::in(CostsStatus::labels())],
            'details.costs.paymentOptions' => ['sometimes', 'array'],
            'details.costs.paymentOptions.*' => $strings(100),
            'details.costs.scholarships' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'details.costs.discounts' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'details.organization' => ['sometimes', 'array:schedule,campus,rhythm'],
            'details.organization.schedule' => ['sometimes', 'nullable', 'string', 'max:255'],
            'details.organization.campus' => ['sometimes', 'nullable', 'string', 'max:255'],
            'details.organization.rhythm' => ['sometimes', 'array'],
            'details.organization.rhythm.*' => $strings(100),
            'details.careers' => ['sometimes', 'array:jobs,sectors,furtherStudies,internship,partnerships'],
            'details.careers.jobs' => ['sometimes', 'array'],
            'details.careers.jobs.*' => $strings(),
            'details.careers.sectors' => ['sometimes', 'array'],
            'details.careers.sectors.*' => $strings(),
            'details.careers.furtherStudies' => ['sometimes', 'array'],
            'details.careers.furtherStudies.*' => $strings(),
            'details.careers.internship' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'details.careers.partnerships' => ['sometimes', 'array'],
            'details.careers.partnerships.*' => $strings(),
            'details.onlineApplication' => ['sometimes', 'boolean'],
            'details.brochureUrl' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'details.academicCalendar' => ['sometimes', 'array'],
            'details.academicCalendar.*.label' => ['required', 'string', 'max:255'],
            'details.academicCalendar.*.date' => ['required', 'date'],
        ];
    }

    /**
     * Publier une offre ne doit pas dépasser la limite de la formule (1 offre en Gratuit).
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('status') || $this->input('status') !== OfferStatus::Published->value) {
                    return;
                }

                $offer = $this->route('offer');
                if ($offer instanceof Offer && $offer->status === OfferStatus::Published) {
                    return;
                }

                $establishment = $this->establishment();
                if (! $establishment->canPublishAnotherOffer($offer instanceof Offer ? $offer : null)) {
                    $plan = $establishment->currentPlan();
                    $limit = $plan->max_published_offers;
                    $validator->errors()->add('status', sprintf(
                        'La formule %s permet %d %s. Archivez une offre ou passez à une formule supérieure pour en publier davantage.',
                        $plan->name,
                        $limit,
                        $limit > 1 ? 'offres publiées' : 'offre publiée',
                    ));
                }
            },
        ];
    }

    public function establishment(): Establishment
    {
        $offer = $this->route('offer');

        return $offer instanceof Offer ? $offer->establishment : $this->route('establishment');
    }

    /**
     * Colonnes de la table `offers` correspondant aux champs envoyés.
     *
     * @return array<string, mixed>
     */
    public function offerAttributes(): array
    {
        $data = $this->validated();
        $attributes = [];

        $set = function (string $path, string $column, ?callable $transform = null) use ($data, &$attributes): void {
            if (Arr::has($data, $path)) {
                $value = Arr::get($data, $path);
                $attributes[$column] = $transform ? $transform($value) : $value;
            }
        };

        $set('title', 'title');
        $set('domain', 'domain_id', fn (?string $name) => $name ? Domain::where('name', $name)->value('id') : null);
        $set('kind', 'kind', fn (string $label) => OfferKind::fromLabel($label));
        $set('diploma', 'diploma', fn (?string $label) => Diploma::fromNullableLabel($label));
        $set('durationYears', 'duration_years');
        $set('ageRange', 'age_min', fn (?array $range) => $range['min'] ?? null);
        $set('ageRange', 'age_max', fn (?array $range) => $range['max'] ?? null);
        $set('fees', 'fees');
        $set('feesPeriod', 'fees_period', fn (string $label) => FeesPeriod::fromLabel($label));
        $set('registrationFee', 'registration_fee');
        $set('registrationPeriod', 'registration_starts_on', fn (?array $period) => $period['start'] ?? null);
        $set('registrationPeriod', 'registration_ends_on', fn (?array $period) => $period['end'] ?? null);
        $set('startDate', 'starts_on');
        $set('modality', 'modality', fn (string $label) => Modality::fromLabel($label));
        $set('registration', 'registration_status', fn (string $label) => RegistrationStatus::fromLabel($label));
        $set('languages', 'languages');
        $set('admission.level', 'admission_level', fn (string $label) => AdmissionLevel::fromLabel($label));
        $set('admission.bacSeries', 'bac_series');
        $set('admission.selection', 'selection', fn (string $label) => AdmissionSelection::fromLabel($label));
        $set('housing', 'housing', fn (string $label) => HousingAvailability::fromLabel($label));
        $set('scholarship', 'scholarship', fn (string $label) => ScholarshipAvailability::fromLabel($label));
        $set('imageSrc', 'image');
        $set('status', 'status');

        $set('details.description', 'description');
        $set('details.objectives', 'objectives');
        $set('details.skills', 'skills');
        $set('details.subjects', 'subjects');
        $set('details.program', 'program');
        $set('details.specializations', 'specializations');
        $set('details.teachingMethods', 'teaching_methods');
        $set('details.evaluation', 'evaluation');
        $set('details.admission.prerequisites', 'prerequisites');
        $set('details.admission.specialConditions', 'special_conditions');
        $set('details.admission.minAge', 'min_age');
        $set('details.costs.applicationFee', 'application_fee');
        $set('details.costs.otherFees', 'other_fees');
        $set('details.costs.status', 'costs_status', fn (string $label) => CostsStatus::fromLabel($label));
        $set('details.costs.paymentOptions', 'payment_options');
        $set('details.costs.scholarships', 'scholarships_info');
        $set('details.costs.discounts', 'discounts');
        $set('details.organization.schedule', 'schedule');
        $set('details.organization.campus', 'campus');
        $set('details.organization.rhythm', 'rhythm');
        $set('details.careers.jobs', 'jobs');
        $set('details.careers.sectors', 'sectors');
        $set('details.careers.furtherStudies', 'further_studies');
        $set('details.careers.internship', 'internship');
        $set('details.careers.partnerships', 'partnerships');
        $set('details.onlineApplication', 'online_application');
        $set('details.brochureUrl', 'brochure_url');
        $set('details.academicCalendar', 'academic_calendar');

        return $attributes;
    }
}
