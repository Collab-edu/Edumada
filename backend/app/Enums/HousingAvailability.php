<?php

namespace App\Enums;

/**
 * Hébergement proposé par l'établissement.
 */
enum HousingAvailability: string
{
    use HasLabel;

    case Available = 'available';
    case Unavailable = 'unavailable';
    case Unknown = 'unknown';

    public function label(): string
    {
        return match ($this) {
            self::Available => 'Disponible',
            self::Unavailable => 'Non disponible',
            self::Unknown => 'Non renseigné',
        };
    }
}
