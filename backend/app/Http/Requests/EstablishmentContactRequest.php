<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Question d'un étudiant à un établissement, sans offre précise. Nom et e-mail viennent du compte.
 */
class EstablishmentContactRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:3000'],
            'phone' => ['nullable', 'string', 'max:30'],
        ];
    }
}
