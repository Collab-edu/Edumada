<?php

namespace App\Enums;

/**
 * Rythme de facturation : mensuel, annuel ou campagne saisonnière Premium.
 */
enum BillingCycle: string
{
    use HasLabel;

    case Monthly = 'monthly';
    case Yearly = 'yearly';
    case Campaign = 'campaign';

    public function label(): string
    {
        return match ($this) {
            self::Monthly => 'Mensuel',
            self::Yearly => 'Annuel',
            self::Campaign => 'Campagne',
        };
    }
}
