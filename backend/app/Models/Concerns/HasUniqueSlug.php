<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Slug lisible et unique servant d'identifiant dans les URL du site (/etablissements/[id]…).
 */
trait HasUniqueSlug
{
    public static function uniqueSlug(string $source): string
    {
        $base = Str::slug($source) ?: 'element';
        $slug = $base;
        $suffix = 2;

        while (static::slugIsTaken($slug)) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private static function slugIsTaken(string $slug): bool
    {
        $query = static::query();

        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            $query->withTrashed();
        }

        return $query->where('slug', $slug)->exists();
    }
}
