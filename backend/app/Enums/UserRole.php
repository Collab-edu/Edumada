<?php

namespace App\Enums;

/**
 * Type de compte : étudiant, établissement (Gratuit, Pro ou Premium selon sa formule) ou administrateur.
 */
enum UserRole: string
{
    use HasLabel;

    case Student = 'student';
    case Establishment = 'establishment';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Student => 'Étudiant',
            self::Establishment => 'Établissement',
            self::Admin => 'Administrateur',
        };
    }
}
