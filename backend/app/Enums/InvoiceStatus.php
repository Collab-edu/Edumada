<?php

namespace App\Enums;

/**
 * État d'une facture de formule payante.
 */
enum InvoiceStatus: string
{
    use HasLabel;

    case Pending = 'pending';
    case Paid = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente de paiement',
            self::Paid => 'Payée',
            self::Cancelled => 'Annulée',
        };
    }
}
