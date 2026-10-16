<?php

namespace App\Enums;

/**
 * Rôle d'un utilisateur au sein d'un établissement qu'il représente.
 */
enum EstablishmentMemberRole: string
{
    use HasLabel;

    case Owner = 'owner';
    case Editor = 'editor';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Propriétaire',
            self::Editor => 'Éditeur',
        };
    }
}
