<?php

namespace App\Enums;

/**
 * Nature de l'offre : formation diplômante, niveau scolaire, accueil (crèche, accompagnement) ou stage.
 */
enum OfferKind: string
{
    use HasLabel;

    case Formation = 'formation';
    case Level = 'niveau';
    case Care = 'accueil';
    case Internship = 'stage';

    public function label(): string
    {
        return match ($this) {
            self::Formation => 'formation',
            self::Level => 'niveau',
            self::Care => 'accueil',
            self::Internship => 'stage',
        };
    }
}
