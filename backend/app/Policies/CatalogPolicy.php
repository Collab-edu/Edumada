<?php

namespace App\Policies;

use App\Models\User;

/**
 * Référentiels du catalogue (catégories, sous-catégories, domaines) : lecture publique,
 * modification réservée aux administrateurs.
 */
class CatalogPolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user): bool
    {
        return $user->isAdmin();
    }
}
