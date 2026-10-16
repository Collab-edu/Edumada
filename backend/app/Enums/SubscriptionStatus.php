<?php

namespace App\Enums;

/**
 * État d'un abonnement. À l'expiration, seules les fonctions payantes sont suspendues.
 */
enum SubscriptionStatus: string
{
    use HasLabel;

    case Active = 'active';
    case Grace = 'grace';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Grace => 'Période de grâce',
            self::Expired => 'Expiré',
            self::Cancelled => 'Résilié',
        };
    }
}
