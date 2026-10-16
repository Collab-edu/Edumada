<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Données du site
    |--------------------------------------------------------------------------
    |
    | Dossier contenant data.json et formation-details.json du frontend Next.js.
    | Le seeder les importe pour que l'API serve exactement les données du site.
    |
    */

    'site_data_path' => env('EDUMADA_SITE_DATA_PATH', base_path('../public/data')),

    /*
    |--------------------------------------------------------------------------
    | Site public
    |--------------------------------------------------------------------------
    |
    | Adresse du site Next.js, utilisée dans les liens des e-mails.
    |
    */

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    /*
    |--------------------------------------------------------------------------
    | Abonnements
    |--------------------------------------------------------------------------
    |
    | Rappels avant expiration (en jours) et période de grâce après la date de fin,
    | pendant laquelle les fonctions payantes restent actives.
    |
    */

    'subscription_reminder_days' => [30, 7, 1],

    'subscription_grace_days' => (int) env('EDUMADA_GRACE_DAYS', 7),

    /*
    |--------------------------------------------------------------------------
    | Paiement
    |--------------------------------------------------------------------------
    |
    | Coordonnées affichées à l'établissement pour régler sa facture. Le paiement
    | est ensuite confirmé par un administrateur, qui active la formule.
    |
    */

    'payment_instructions' => [
        'mvola' => env('EDUMADA_PAY_MVOLA', 'MVola : 034 00 000 00 (Edumada)'),
        'orange_money' => env('EDUMADA_PAY_ORANGE', 'Orange Money : 032 00 000 00 (Edumada)'),
        'airtel_money' => env('EDUMADA_PAY_AIRTEL', 'Airtel Money : 033 00 000 00 (Edumada)'),
        'bank_transfer' => env('EDUMADA_PAY_BANK', 'Virement : IBAN à communiquer par Edumada'),
        'cash' => env('EDUMADA_PAY_CASH', 'Espèces : au bureau Edumada, sur rendez-vous'),
    ],

];
