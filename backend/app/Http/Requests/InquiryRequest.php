<?php

namespace App\Http\Requests;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Models\Offer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Demande d'information ou candidature d'un étudiant. On ne collecte que le nécessaire :
 * nom et e-mail viennent du compte ; téléphone facultatif ; pièces jointes pour une candidature seulement.
 */
class InquiryRequest extends FormRequest
{
    public const MAX_ATTACHMENTS = 5;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(InquiryType::class)],
            'message' => ['required_if:type,information', 'nullable', 'string', 'max:3000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'attachments' => ['nullable', 'array', 'max:'.self::MAX_ATTACHMENTS, 'prohibited_unless:type,application'],
            'attachments.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    /**
     * Candidature : seulement si l'établissement l'a activée, et une seule candidature en cours par offre.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('type') || $this->input('type') !== InquiryType::Application->value) {
                    return;
                }

                /** @var Offer $offer */
                $offer = $this->route('offer');

                if (! $offer->online_application) {
                    $validator->errors()->add('type', 'La candidature en ligne n\'est pas activée pour cette offre. Envoyez plutôt une demande d\'information.');

                    return;
                }

                $alreadyApplied = $offer->inquiries()
                    ->where('user_id', $this->user()->id)
                    ->where('type', InquiryType::Application)
                    ->whereNotIn('status', [InquiryStatus::Refused, InquiryStatus::Accepted])
                    ->exists();

                if ($alreadyApplied) {
                    $validator->errors()->add('type', 'Vous avez déjà une candidature en cours pour cette offre.');
                }
            },
        ];
    }
}
