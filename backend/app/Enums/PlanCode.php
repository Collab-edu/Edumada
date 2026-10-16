<?php

namespace App\Enums;

/**
 * Formules des comptes établissement.
 */
enum PlanCode: string
{
    use HasLabel;

    case Free = 'free';
    case Pro = 'pro';
    case Premium = 'premium';

    public function label(): string
    {
        return match ($this) {
            self::Free => 'Gratuit',
            self::Pro => 'Pro',
            self::Premium => 'Premium',
        };
    }
}
