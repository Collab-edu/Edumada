<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Remet le site à zéro avant un vrai lancement : efface le contenu de test (établissements, offres,
 * stages, demandes, avis, favoris, statistiques, factures, actualités…) et tous les comptes sauf
 * les administrateurs. Les référentiels restent : catégories, types, domaines et formules.
 */
class ResetData extends Command
{
    protected $signature = 'edumada:reset-data {--force : Ne pas demander de confirmation}';

    protected $description = 'Efface les données de test (contenu et comptes non administrateurs), garde les référentiels';

    /**
     * Tables vidées entièrement, des dépendantes vers les principales.
     *
     * @var list<string>
     */
    private const TABLES = [
        'inquiry_messages',
        'inquiry_attachments',
        'inquiry_status_changes',
        'inquiries',
        'internship_applications',
        'internships',
        'favorites',
        'reviews',
        'reports',
        'establishment_claims',
        'daily_stats',
        'campaigns',
        'invoices',
        'subscriptions',
        'offers',
        'establishment_user',
        'establishments',
        'contact_messages',
        'articles',
        'audit_logs',
        'sessions',
        'password_reset_tokens',
        'jobs',
        'failed_jobs',
    ];

    /**
     * Dossiers de fichiers envoyés : [disque, dossier].
     *
     * @var list<array{0: string, 1: string}>
     */
    private const DIRECTORIES = [
        ['public', 'uploads'],
        ['public', 'documents'],
        ['local', 'inquiries'],
        ['local', 'internship-applications'],
    ];

    public function handle(): int
    {
        $tables = array_values(array_filter(self::TABLES, fn (string $table) => Schema::hasTable($table)));
        $users = User::where('role', '!=', UserRole::Admin->value);
        $admins = User::where('role', UserRole::Admin->value)->pluck('email');

        $this->line('Seront effacés :');
        foreach ($tables as $table) {
            $count = DB::table($table)->count();
            if ($count > 0) {
                $this->line(sprintf('  - %s : %d', $table, $count));
            }
        }
        $this->line(sprintf('  - comptes non administrateurs : %d', $users->count()));
        $this->line('  - fichiers envoyés (images, PDF, pièces jointes, CV)');
        $this->newLine();
        $this->line('Restent : catégories, types, domaines, formules et les administrateurs ('.($admins->implode(', ') ?: 'aucun').').');

        if ($admins->isEmpty()) {
            $this->warn('Aucun administrateur : créez-en un ensuite avec php artisan edumada:admin.');
        }

        if (! $this->option('force') && $this->ask('Tapez EFFACER pour confirmer') !== 'EFFACER') {
            $this->info('Rien n\'a été effacé.');

            return self::SUCCESS;
        }

        Schema::disableForeignKeyConstraints();
        try {
            foreach ($tables as $table) {
                DB::table($table)->truncate();
            }
            DB::table('personal_access_tokens')
                ->where('tokenable_type', User::class)
                ->whereNotIn('tokenable_id', User::where('role', UserRole::Admin->value)->select('id'))
                ->delete();
            User::where('role', '!=', UserRole::Admin->value)->delete();
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        foreach (self::DIRECTORIES as [$disk, $directory]) {
            Storage::disk($disk)->deleteDirectory($directory);
        }
        Cache::flush();

        $this->info('Données de test effacées. Le site est prêt pour un vrai test.');

        return self::SUCCESS;
    }
}
