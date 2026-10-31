<?php

namespace App\Enums;

/**
 * Suivi d'une candidature à un stage par l'administration Edumada.
 */
enum InternshipApplicationStatus: string
{
    use HasLabel;

    case New = 'new';
    case InReview = 'in_review';
    case Accepted = 'accepted';
    case Refused = 'refused';

    public function label(): string
    {
        return match ($this) {
            self::New => 'Nouvelle',
            self::InReview => 'En cours',
            self::Accepted => 'Acceptée',
            self::Refused => 'Refusée',
        };
    }
}
