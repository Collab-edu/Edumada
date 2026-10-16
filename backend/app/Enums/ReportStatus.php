<?php

namespace App\Enums;

/**
 * Traitement d'un signalement.
 */
enum ReportStatus: string
{
    use HasLabel;

    case Open = 'open';
    case Resolved = 'resolved';
    case Dismissed = 'dismissed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Ouvert',
            self::Resolved => 'Corrigé',
            self::Dismissed => 'Sans suite',
        };
    }
}
