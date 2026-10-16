<?php

namespace App\Enums;

/**
 * Moyen de paiement d'une facture, confirmé manuellement par un administrateur.
 */
enum PaymentMethod: string
{
    use HasLabel;

    case Mvola = 'mvola';
    case OrangeMoney = 'orange_money';
    case AirtelMoney = 'airtel_money';
    case BankTransfer = 'bank_transfer';
    case Cash = 'cash';

    public function label(): string
    {
        return match ($this) {
            self::Mvola => 'MVola',
            self::OrangeMoney => 'Orange Money',
            self::AirtelMoney => 'Airtel Money',
            self::BankTransfer => 'Virement bancaire',
            self::Cash => 'Espèces',
        };
    }
}
