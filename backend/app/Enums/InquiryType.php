<?php

namespace App\Enums;

/**
 * Demande d'information ou candidature envoyée par un étudiant.
 */
enum InquiryType: string
{
    use HasLabel;

    case Information = 'information';
    case Application = 'application';

    public function label(): string
    {
        return match ($this) {
            self::Information => 'Demande d\'information',
            self::Application => 'Candidature',
        };
    }
}
