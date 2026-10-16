<?php

namespace App\Enums;

/**
 * Établissement public ou privé.
 */
enum EstablishmentSector: string
{
    use HasLabel;

    case Public = 'public';
    case Private = 'private';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Public',
            self::Private => 'Privé',
        };
    }
}
