<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * Crée le compte administrateur (production : aucun compte de démonstration n'est créé).
 * Un compte existant garde son mot de passe ; il est seulement promu administrateur.
 */
class CreateAdmin extends Command
{
    protected $signature = 'edumada:admin
        {--email= : Adresse e-mail (sinon ADMIN_EMAIL)}
        {--name=Administrateur Edumada : Nom affiché}
        {--password= : Mot de passe, pour un nouveau compte (sinon ADMIN_PASSWORD)}';

    protected $description = 'Crée ou promeut le compte administrateur d\'Edumada';

    public function handle(): int
    {
        $email = $this->option('email') ?: getenv('ADMIN_EMAIL');
        $password = $this->option('password') ?: getenv('ADMIN_PASSWORD');

        if (! $email) {
            $this->error('Indiquez --email ou la variable ADMIN_EMAIL.');

            return self::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if ($user === null) {
            $validator = Validator::make(['email' => $email, 'password' => $password], [
                'email' => ['required', 'email'],
                'password' => ['required', Password::defaults()],
            ]);
            if ($validator->fails()) {
                $this->error(implode(' ', $validator->errors()->all()));

                return self::FAILURE;
            }

            $user = new User(['name' => $this->option('name'), 'email' => $email, 'password' => $password]);
            $user->email_verified_at = now();
        }

        $user->role = UserRole::Admin;
        $created = ! $user->exists;
        $user->save();

        $this->info($created ? "Compte administrateur créé : {$email}" : "Compte administrateur à jour : {$email}");

        return self::SUCCESS;
    }
}
