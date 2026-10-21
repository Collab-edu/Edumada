<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * PostgreSQL : extension « unaccent » pour des recherches insensibles aux accents
 * (« ecole » trouve « École »), comme la collation de MySQL / MariaDB. Sans effet ailleurs.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS unaccent');
        }
    }

    public function down(): void
    {
        // L'extension reste installée : d'autres objets de la base peuvent en dépendre.
    }
};
