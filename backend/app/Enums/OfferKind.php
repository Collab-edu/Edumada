<?php

namespace App\Enums;

/**
 * Nature de l'offre : formation diplômante, niveau scolaire ou accueil (crèche, accompagnement).
 */
enum OfferKind: string
{
    use HasLabel;

    case Formation = 'formation';
    case Level = 'niveau';
    case Care = 'accueil';

    public function label(): string
    {
        return match ($this) {
            self::Formation => 'formation',
            self::Level => 'niveau',
            self::Care => 'accueil',
        };
    }
}
