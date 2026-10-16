<?php

namespace App\Enums;

/**
 * Statut de traitement d'une demande ou candidature.
 */
enum InquiryStatus: string
{
    use HasLabel;

    case New = 'new';
    case InReview = 'in_review';
    case InformationRequested = 'information_requested';
    case Interview = 'interview';
    case Accepted = 'accepted';
    case Refused = 'refused';

    public function label(): string
    {
        return match ($this) {
            self::New => 'Envoyée',
            self::InReview => 'En cours d\'examen',
            self::InformationRequested => 'Informations demandées',
            self::Interview => 'Entretien',
            self::Accepted => 'Acceptée',
            self::Refused => 'Refusée',
        };
    }
}
