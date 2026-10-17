<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Inscription d'un étudiant ou d'un représentant d'établissement.
 * Un compte administrateur ne peut jamais être créé par cette voie.
 */
class RegisterRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::defaults()],
            'accountType' => ['required', Rule::in([UserRole::Student->value, UserRole::Establishment->value])],
            'phone' => ['nullable', 'required_with:establishment', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:255'],
            'studyLevel' => ['nullable', 'string', 'max:255'],

            // Responsable d'un établissement (page « Référencer mon établissement »).
            'firstName' => ['nullable', 'required_with:establishment', 'string', 'max:255'],
            'lastName' => ['nullable', 'required_with:establishment', 'string', 'max:255'],
            'jobTitle' => ['nullable', 'required_with:establishment', 'string', 'max:255'],

            // Fiche minimale créée en brouillon avec le compte.
            'establishment' => ['sometimes', 'array:name,category,city,email,website', Rule::prohibitedIf($this->input('accountType') !== UserRole::Establishment->value)],
            'establishment.name' => ['required_with:establishment', 'string', 'max:255'],
            'establishment.category' => ['required_with:establishment', 'string', Rule::exists('categories', 'slug')],
            'establishment.city' => ['required_with:establishment', 'string', 'max:255'],
            'establishment.email' => ['nullable', 'email', 'max:255'],
            'establishment.website' => ['nullable', 'url', 'max:255'],
        ];
    }
}
