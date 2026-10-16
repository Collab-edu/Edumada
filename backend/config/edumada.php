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

];
