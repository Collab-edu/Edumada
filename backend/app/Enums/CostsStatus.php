<?php

namespace App\Enums;

/**
 * Fiabilité des montants : confirmés par l'établissement ou estimés par Edumada.
 */
enum CostsStatus: string
{
    use HasLabel;

    case Confirmed = 'confirmed';
    case Estimated = 'estimated';
    case Undisclosed = 'undisclosed';

    public function label(): string
    {
        return match ($this) {
            self::Confirmed => 'Confirmés',
            self::Estimated => 'Estimés',
            self::Undisclosed => 'Non communiqués',
        };
    }
}
