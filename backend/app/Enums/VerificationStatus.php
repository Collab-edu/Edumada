<?php

namespace App\Enums;

/**
 * Statut de vérification de la fiche par Edumada ; jamais accordé du seul fait d'un paiement.
 */
enum VerificationStatus: string
{
    use HasLabel;

    case Verified = 'verified';
    case Pending = 'pending';
    case Unverified = 'unverified';

    public function label(): string
    {
        return match ($this) {
            self::Verified => 'Vérifié',
            self::Pending => 'En cours',
            self::Unverified => 'Non vérifié',
        };
    }
}
