<?php

namespace App\Enums;

/**
 * Cycle de publication d'une offre éducative. Seules les offres publiées comptent dans la limite de la formule.
 */
enum OfferStatus: string
{
    use HasLabel;

    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Published => 'Publiée',
            self::Archived => 'Archivée',
        };
    }
}
