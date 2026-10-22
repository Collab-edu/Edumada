<?php

namespace App\Http\Requests;

use App\Enums\Diploma;
use App\Enums\EstablishmentSector;
use App\Enums\HousingAvailability;
use App\Enums\Modality;
use App\Enums\OfferKind;
use App\Enums\RegistrationStatus;
use App\Enums\ScholarshipAvailability;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Paramètres de recherche des offres, calqués sur les filtres de la page /recherche du site.
 * Les valeurs sont les libellés affichés sur le site ; dans une liste, les choix se combinent en « OU ».
 */
class OfferSearchRequest extends FormRequest
{
    /** Niveau actuel de l'étudiant (filtre « Mon niveau »). */
    public const STUDENT_LEVELS = ['Sans BAC', 'BAC', 'BAC+2', 'BAC+3'];

    public const SORTS = ['pertinence', 'frais-asc', 'frais-desc', 'duree-asc'];

    /** Tranches de durée du filtre « Durée » (en années). */
    public const DURATIONS = ["Moins d'un an", '1 an', '2 ans', '3 ans', '4 ans', '5 ans ou plus'];

    /** Langues proposées par le filtre ; « Autre » = toute autre langue. */
    public const KNOWN_LANGUAGES = ['Français', 'Malgache', 'Anglais'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'domain' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            // Position du lieu choisi (« latitude,longitude ») : évite toute ambiguïté entre homonymes (plusieurs Ivato).
            'near' => ['nullable', 'string', 'regex:/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/'],
            'type' => ['nullable', Rule::in(EstablishmentSector::labels())],
            'kind' => ['nullable', Rule::in(OfferKind::labels())],
            'school' => ['nullable', 'string', 'max:255'],
            'feesMin' => ['nullable', 'integer', 'min:0'],
            'feesMax' => ['nullable', 'integer', 'min:0'],
            'feeRanges' => ['nullable', 'array', 'max:10'],
            'feeRanges.*' => ['string', 'regex:/^\d+-\d*$/'],
            'durations' => ['nullable', 'array'],
            'durations.*' => [Rule::in(self::DURATIONS)],
            'durationMin' => ['nullable', 'numeric', 'min:0'],
            'durationMax' => ['nullable', 'numeric', 'min:0'],
            'modalities' => ['nullable', 'array'],
            'modalities.*' => [Rule::in(Modality::labels())],
            'diplomas' => ['nullable', 'array'],
            'diplomas.*' => [Rule::in(Diploma::labels())],
            'registration' => ['nullable', Rule::in(RegistrationStatus::labels())],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
            'level' => ['nullable', Rule::in(self::STUDENT_LEVELS)],
            'bacSeries' => ['nullable', 'array'],
            'bacSeries.*' => ['string', 'max:30'],
            'housing' => ['nullable', 'array'],
            'housing.*' => [Rule::in(HousingAvailability::labels())],
            'scholarships' => ['nullable', 'array'],
            'scholarships.*' => [Rule::in(ScholarshipAvailability::labels())],
            'childAge' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'sort' => ['nullable', Rule::in(self::SORTS)],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'ids' => ['nullable', 'array', 'max:100'],
            'ids.*' => ['string', 'max:255'],
        ];
    }
}
