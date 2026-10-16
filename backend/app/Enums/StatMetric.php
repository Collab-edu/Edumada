<?php

namespace App\Enums;

/**
 * Mesure statistique enregistrée par jour.
 */
enum StatMetric: string
{
    use HasLabel;

    case View = 'view';
    case Impression = 'impression';
    case Click = 'click';
    case ContactClick = 'contact_click';
    case WebsiteClick = 'website_click';
    case ApplyClick = 'apply_click';

    public function label(): string
    {
        return match ($this) {
            self::View => 'Vues',
            self::Impression => 'Impressions',
            self::Click => 'Clics vers la fiche',
            self::ContactClick => 'Clics de contact',
            self::WebsiteClick => 'Clics vers le site',
            self::ApplyClick => 'Clics « Postuler »',
        };
    }
}
