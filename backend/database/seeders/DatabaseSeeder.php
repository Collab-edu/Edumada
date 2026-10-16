<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Formules, données d'exemple du site, puis un compte de démonstration par type de compte.
     */
    public function run(): void
    {
        $this->call([
            PlanSeeder::class,
            SiteDataSeeder::class,
        ]);

        if (! app()->isProduction()) {
            $this->call(DemoAccountSeeder::class);
        }
    }
}
