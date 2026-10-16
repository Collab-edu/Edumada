<?php

namespace App\Enums;

/**
 * Modération des avis : seuls les avis publiés sont visibles.
 */
enum ReviewStatus: string
{
    use HasLabel;

    case Pending = 'pending';
    case Published = 'published';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Published => 'Publié',
            self::Rejected => 'Refusé',
        };
    }
}
