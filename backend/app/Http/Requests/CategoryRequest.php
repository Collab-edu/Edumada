<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Création (POST) ou modification partielle (PATCH) d'une catégorie, au format `CategoryType`.
 */
class CategoryRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';
        $category = $this->route('category');

        return [
            'id' => ['sometimes', 'string', 'max:100', 'alpha_dash', Rule::unique('categories', 'slug')->ignore($category)],
            'label' => [$required, 'string', 'max:255'],
            'shortLabel' => [$required, 'string', 'max:100'],
            'icon' => [$required, 'string', 'max:100'],
            'offersLabel' => [$required, 'string', 'max:100'],
            'fields' => ['sometimes', 'array:'.implode(',', array_keys(Category::DEFAULT_FIELDS))],
            'fields.*' => ['boolean'],
            'subCategories' => ['sometimes', 'array'],
            'subCategories.*' => ['string', 'max:255', 'distinct'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * Colonnes de la table `categories` correspondant aux champs envoyés.
     *
     * @return array<string, mixed>
     */
    public function categoryAttributes(): array
    {
        $map = [
            'id' => 'slug',
            'label' => 'label',
            'shortLabel' => 'short_label',
            'icon' => 'icon',
            'offersLabel' => 'offers_label',
            'fields' => 'fields',
            'position' => 'position',
        ];

        $attributes = [];
        foreach ($map as $input => $column) {
            if ($this->has($input)) {
                $attributes[$column] = $this->validated($input);
            }
        }

        if (isset($attributes['fields'])) {
            $attributes['fields'] = array_map('boolval', array_merge(Category::DEFAULT_FIELDS, $attributes['fields']));
        }

        return $attributes;
    }
}
