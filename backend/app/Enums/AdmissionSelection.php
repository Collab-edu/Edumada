<?php

namespace App\Enums;

/**
 * Mode de sélection des candidats.
 */
enum AdmissionSelection: string
{
    use HasLabel;

    case DirectEnrolment = 'direct';
    case Application = 'application';
    case ApplicationAndInterview = 'application_interview';
    case CompetitiveExam = 'competitive_exam';

    public function label(): string
    {
        return match ($this) {
            self::DirectEnrolment => 'Inscription directe',
            self::Application => 'Sur dossier',
            self::ApplicationAndInterview => 'Dossier et entretien',
            self::CompetitiveExam => 'Concours',
        };
    }
}
