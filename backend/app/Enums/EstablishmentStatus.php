<?php

namespace App\Enums;

/**
 * Cycle de publication d'une fiche établissement (modération avant publication).
 */
enum EstablishmentStatus: string
{
    use HasLabel;

    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case Published = 'published';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::PendingReview => 'En attente de validation',
            self::Published => 'Publiée',
            self::Suspended => 'Suspendue',
        };
    }
}
