<?php

namespace App\Enums;

/**
 * Niveau requis pour être admis.
 */
enum AdmissionLevel: string
{
    use HasLabel;

    case None = 'none';
    case Bac = 'bac';
    case BacPlus2 = 'bac_plus_2';
    case BacPlus3 = 'bac_plus_3';
    case BacPlus4 = 'bac_plus_4';

    public function label(): string
    {
        return match ($this) {
            self::None => 'Aucun',
            self::Bac => 'BAC',
            self::BacPlus2 => 'BAC+2',
            self::BacPlus3 => 'BAC+3',
            self::BacPlus4 => 'BAC+4',
        };
    }
}
