<?php

namespace App\Enums;

/**
 * Motif d'un signalement d'information erronée.
 */
enum ReportReason: string
{
    use HasLabel;

    case WrongInformation = 'wrong_information';
    case Fees = 'fees';
    case Dates = 'dates';
    case Closed = 'closed';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::WrongInformation => 'Information erronée',
            self::Fees => 'Frais incorrects',
            self::Dates => 'Dates incorrectes',
            self::Closed => 'Établissement fermé',
            self::Other => 'Autre',
        };
    }
}
