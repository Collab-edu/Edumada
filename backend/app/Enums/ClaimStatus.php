<?php

namespace App\Enums;

/**
 * Revendication d'une fiche par un établissement.
 */
enum ClaimStatus: string
{
    use HasLabel;

    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Approved => 'Acceptée',
            self::Rejected => 'Refusée',
        };
    }
}
