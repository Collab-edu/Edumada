<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $label = fake()->unique()->words(3, true);

        return [
            'slug' => Str::slug($label),
            'label' => ucfirst($label),
            'short_label' => ucfirst($label),
            'icon' => 'tabler:building-bank',
            'offers_label' => 'Formations proposées',
            'fields' => Category::DEFAULT_FIELDS,
            'position' => 0,
        ];
    }
}
