<?php

namespace App\Enums;

/**
 * Établissement public, privé ou semi-privé (privé avec une participation publique, confessionnel…).
 */
enum EstablishmentSector: string
{
    use HasLabel;

    case Public = 'public';
    case Private = 'private';
    case SemiPrivate = 'semi_private';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Public',
            self::Private => 'Privé',
            self::SemiPrivate => 'Semi-privé',
        };
    }
}
