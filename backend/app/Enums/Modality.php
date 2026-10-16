<?php

namespace App\Enums;

/**
 * Modalité d'enseignement.
 */
enum Modality: string
{
    use HasLabel;

    case OnSite = 'on_site';
    case Remote = 'remote';
    case Hybrid = 'hybrid';

    public function label(): string
    {
        return match ($this) {
            self::OnSite => 'Présentiel',
            self::Remote => 'Distanciel',
            self::Hybrid => 'Hybride',
        };
    }
}
