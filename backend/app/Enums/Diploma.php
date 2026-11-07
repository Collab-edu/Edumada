<?php

namespace App\Enums;

/**
 * Diplôme préparé par une offre.
 */
enum Diploma: string
{
    use HasLabel;

    case Attestation = 'attestation';
    case Certificate = 'certificate';
    case Cap = 'cap';
    case Bt = 'bt';
    case Bts = 'bts';
    case Licence = 'licence';
    case Master = 'master';
    case Doctorate = 'doctorate';
    case Cepe = 'cepe';
    case Bepc = 'bepc';
    case Bac = 'bac';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Attestation => 'Attestation',
            self::Certificate => 'Certificat',
            self::Cap => 'CAP',
            self::Bt => 'BT',
            self::Bts => 'BTS',
            self::Licence => 'Licence',
            self::Master => 'Master',
            self::Doctorate => 'Doctorat',
            self::Cepe => 'CEPE',
            self::Bepc => 'BEPC',
            self::Bac => 'BAC',
            self::Other => 'Autre',
        };
    }
}
