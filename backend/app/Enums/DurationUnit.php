<?php

namespace App\Enums;

/**
 * Unité de durée d'une formation professionnelle (« 3 mois », « 40 heures »…).
 */
enum DurationUnit: string
{
    use HasLabel;

    case Hours = 'hours';
    case Days = 'days';
    case Weeks = 'weeks';
    case Months = 'months';
    case Years = 'years';

    public function label(): string
    {
        return match ($this) {
            self::Hours => 'heures',
            self::Days => 'jours',
            self::Weeks => 'semaines',
            self::Months => 'mois',
            self::Years => 'ans',
        };
    }

    /**
     * Durée équivalente en années, pour les filtres et tris par durée (approximation pour les heures).
     */
    public function toYears(float $value): float
    {
        return round(match ($this) {
            self::Hours => $value / 1600,
            self::Days => $value / 365,
            self::Weeks => $value / 52,
            self::Months => $value / 12,
            self::Years => $value,
        }, 2);
    }
}
