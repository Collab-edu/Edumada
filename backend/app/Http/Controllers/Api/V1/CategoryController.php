<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::with('subCategories')->orderBy('position')->get(),
        );
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->load('subCategories'));
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        Gate::authorize('create', Category::class);

        $category = DB::transaction(function () use ($request): Category {
            $attributes = $request->categoryAttributes();
            $attributes['slug'] ??= Category::uniqueSlug($attributes['short_label']);
            $attributes['fields'] ??= Category::DEFAULT_FIELDS;

            $category = Category::create($attributes);
            $this->syncSubCategories($category, $request->validated('subCategories', []));

            return $category;
        });

        return new CategoryResource($category->load('subCategories'));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        Gate::authorize('update', $category);

        DB::transaction(function () use ($request, $category): void {
            $category->update($request->categoryAttributes());

            if ($request->has('subCategories')) {
                $this->syncSubCategories($category, $request->validated('subCategories'));
            }
        });

        return new CategoryResource($category->load('subCategories'));
    }

    /**
     * Une catégorie qui contient encore des établissements ne peut pas être supprimée.
     */
    public function destroy(Category $category): Response
    {
        Gate::authorize('delete', $category);

        if ($category->establishments()->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Cette catégorie contient des établissements : déplacez-les avant de la supprimer.',
            ]);
        }

        $category->delete();

        return response()->noContent();
    }

    /**
     * Les sous-catégories retirées de la liste sont supprimées ; les fiches qui les utilisaient
     * gardent leur catégorie sans sous-catégorie.
     *
     * @param  list<string>  $labels
     */
    private function syncSubCategories(Category $category, array $labels): void
    {
        $category->subCategories()->whereNotIn('label', $labels)->delete();

        foreach (array_values($labels) as $position => $label) {
            $category->subCategories()->updateOrCreate(['label' => $label], ['position' => $position]);
        }
    }
}
