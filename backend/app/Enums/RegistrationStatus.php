<?php

namespace App\Enums;

/**
 * État des inscriptions d'une offre.
 */
enum RegistrationStatus: string
{
    use HasLabel;

    case Open = 'open';
    case Upcoming = 'upcoming';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Ouvertes',
            self::Upcoming => 'À venir',
            self::Closed => 'Fermées',
        };
    }
}
