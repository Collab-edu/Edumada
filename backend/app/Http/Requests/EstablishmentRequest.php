<?php

namespace App\Http\Requests;

use App\Enums\EstablishmentSector;
use App\Enums\PlanCode;
use App\Models\Category;
use App\Models\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Création (POST) ou modification partielle (PATCH) d'une fiche, au format `SchoolType` du site.
 * Statut de publication, vérification et accréditation vérifiée passent par la modération.
 */
class EstablishmentRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'max:255'],
            'initials' => ['sometimes', 'nullable', 'string', 'max:10'],
            'type' => [$required, Rule::in(EstablishmentSector::labels())],
            'category' => [$required, 'string', Rule::exists('categories', 'slug')],
            'subCategory' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => [$required, 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'socialLinks' => ['sometimes', 'array:facebook,instagram,linkedin,youtube'],
            'socialLinks.*' => ['nullable', 'url', 'max:255'],
            'infrastructures' => ['sometimes', 'array', 'max:30'],
            'infrastructures.*' => ['string', 'max:255'],
            'accreditation' => ['sometimes', 'nullable', 'string', 'max:255'],
            'coordinates' => ['sometimes', 'nullable', 'array:lat,lng'],
            'coordinates.lat' => ['required_with:coordinates', 'numeric', 'between:-90,90'],
            'coordinates.lng' => ['required_with:coordinates', 'numeric', 'between:-180,180'],
            'admissionDocuments' => ['sometimes', 'array', 'max:30'],
            'admissionDocuments.*' => ['string', 'max:255'],
            'imageSrc' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'logo' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'photos' => ['sometimes', 'array', 'max:20'],
            'photos.*' => ['url', 'max:2048'],
        ];
    }

    /**
     * La sous-catégorie doit appartenir à la catégorie choisie (ou actuelle).
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                // Limites de la formule : une nouvelle fiche démarre en Gratuit.
                $plan = $this->route('establishment')?->currentPlan() ?? Plan::where('code', PlanCode::Free)->firstOrFail();

                if (! $plan->hasFeature('photoGallery') && count($this->input('photos', [])) > 0) {
                    $validator->errors()->add('photos', 'La galerie photos est réservée aux formules Pro et Premium.');
                }
                $max = $plan->limit('maxInfrastructures');
                if ($max !== null && count($this->input('infrastructures', [])) > $max) {
                    $validator->errors()->add('infrastructures', "Votre formule permet d'indiquer {$max} infrastructures au maximum.");
                }
            },
            function (Validator $validator): void {
                if ($validator->errors()->hasAny(['category', 'subCategory']) || ! $this->filled('subCategory')) {
                    return;
                }

                if ($this->resolvedCategory()?->subCategories()->where('label', $this->input('subCategory'))->doesntExist()) {
                    $validator->errors()->add('subCategory', 'Cette sous-catégorie n\'existe pas dans la catégorie choisie.');
                }
            },
        ];
    }

    /**
     * Colonnes de la table `establishments` correspondant aux champs envoyés.
     *
     * @return array<string, mixed>
     */
    public function establishmentAttributes(): array
    {
        $data = $this->validated();
        $attributes = [];

        $direct = [
            'name' => 'name',
            'initials' => 'initials',
            'city' => 'city',
            'address' => 'address',
            'phone' => 'phone',
            'email' => 'email',
            'website' => 'website',
            'description' => 'description',
            'infrastructures' => 'infrastructures',
            'accreditation' => 'accreditation',
            'admissionDocuments' => 'admission_documents',
            'imageSrc' => 'cover_image',
            'logo' => 'logo',
            'photos' => 'photos',
        ];
        foreach ($direct as $input => $column) {
            if (array_key_exists($input, $data)) {
                $attributes[$column] = $data[$input];
            }
        }

        if (array_key_exists('type', $data)) {
            $attributes['sector'] = EstablishmentSector::fromLabel($data['type']);
        }
        if (array_key_exists('socialLinks', $data)) {
            $attributes['social_links'] = array_filter($data['socialLinks']);
        }
        if (array_key_exists('coordinates', $data)) {
            $attributes['latitude'] = $data['coordinates']['lat'] ?? null;
            $attributes['longitude'] = $data['coordinates']['lng'] ?? null;
        }

        $category = $this->resolvedCategory();
        if (array_key_exists('category', $data)) {
            $attributes['category_id'] = $category->id;
        }
        if (array_key_exists('subCategory', $data) || array_key_exists('category', $data)) {
            $label = $data['subCategory'] ?? $this->route('establishment')?->subCategory?->label;
            $attributes['sub_category_id'] = $label
                ? $category->subCategories()->where('label', $label)->value('id')
                : null;
        }

        return $attributes;
    }

    private function resolvedCategory(): ?Category
    {
        if ($this->filled('category')) {
            return Category::where('slug', $this->input('category'))->first();
        }

        return $this->route('establishment')?->category;
    }
}
