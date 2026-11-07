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
    case Master1 = 'master_1';
    case Master2 = 'master_2';
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
            self::Master1 => 'Master 1',
            self::Master2 => 'Master 2',
            self::Doctorate => 'Doctorat',
            self::Cepe => 'CEPE',
            self::Bepc => 'BEPC',
            self::Bac => 'BAC',
            self::Other => 'Autre',
        };
    }
}
