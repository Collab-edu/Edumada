<?php

namespace App\Http\Requests;

use App\Enums\EstablishmentMemberRole;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Ajout d'un membre à l'équipe d'un établissement. Pour une adresse inconnue, le compte est
 * créé avec le mot de passe provisoire choisi par le propriétaire.
 */
class TeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $exists = User::where('email', $this->input('email'))->exists();

        return [
            'name' => [$exists ? 'nullable' : 'required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'jobTitle' => ['nullable', 'string', 'max:120'],
            'role' => ['required', Rule::enum(EstablishmentMemberRole::class)],
            'password' => [$exists ? 'nullable' : 'required', 'string', Password::defaults()],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Indiquez le nom de la personne.',
            'password.required' => 'Choisissez un mot de passe provisoire pour ce nouveau compte.',
        ];
    }
}
