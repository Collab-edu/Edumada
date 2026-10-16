<?php

namespace App\Enums;

/**
 * Période des frais de scolarité.
 */
enum FeesPeriod: string
{
    use HasLabel;

    case Year = 'an';
    case Month = 'mois';

    public function label(): string
    {
        return match ($this) {
            self::Year => 'an',
            self::Month => 'mois',
        };
    }
}
