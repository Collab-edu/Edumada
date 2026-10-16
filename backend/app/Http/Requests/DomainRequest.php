<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DomainRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'max:255', Rule::unique('domains', 'name')->ignore($this->route('domain'))],
            'icon' => ['sometimes', 'nullable', 'string', 'max:100'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
