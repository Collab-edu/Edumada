<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Format `CategoryType` du site (src/features/categories/types.ts).
 *
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'label' => $this->label,
            'shortLabel' => $this->short_label,
            'icon' => $this->icon,
            'subCategories' => $this->whenLoaded(
                'subCategories',
                fn () => $this->subCategories->map(fn (SubCategory $subCategory) => $subCategory->label)->values(),
            ),
            'offersLabel' => $this->offers_label,
            'fields' => array_merge(Category::DEFAULT_FIELDS, $this->fields ?? []),
        ];
    }
}
