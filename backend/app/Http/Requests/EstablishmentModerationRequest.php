<?php

namespace App\Http\Requests;

use App\Enums\EstablishmentStatus;
use App\Enums\VerificationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Décision d'un administrateur sur une fiche : publication, vérification, accréditation.
 */
class EstablishmentModerationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('moderate', $this->route('establishment'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(EstablishmentStatus::class)],
            'verification' => ['sometimes', Rule::enum(VerificationStatus::class)],
            'accreditationVerified' => ['sometimes', 'boolean'],
        ];
    }
}
