<?php

namespace App\Enums;

/**
 * État d'une campagne Premium.
 */
enum CampaignStatus: string
{
    use HasLabel;

    case Active = 'active';
    case Paused = 'paused';
    case Ended = 'ended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Paused => 'En pause',
            self::Ended => 'Terminée',
        };
    }
}
