<?php

namespace App\Enums;

/**
 * Bourses proposées.
 */
enum ScholarshipAvailability: string
{
    use HasLabel;

    case Available = 'available';
    case Unknown = 'unknown';

    public function label(): string
    {
        return match ($this) {
            self::Available => 'Bourses disponibles',
            self::Unknown => 'Non renseigné',
        };
    }
}
