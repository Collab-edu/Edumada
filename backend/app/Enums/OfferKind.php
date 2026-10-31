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

    /**
     * Types d'offres proposés à une catégorie d'établissement (toutes pour une catégorie sans règle).
     *
     * @return list<self>
     */
    public static function forCategory(?string $slug): array
    {
        return match ($slug) {
            'superieur', 'formation-pro' => [self::Formation],
            'scolaire' => [self::Level],
            'petite-enfance' => [self::Care, self::Level],
            default => self::cases(),
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Formation => 'formation',
            self::Level => 'niveau',
            self::Care => 'accueil',
        };
    }
}
