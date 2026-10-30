<?php

namespace Database\Seeders;

use App\Enums\BillingCycle;
use App\Enums\EstablishmentMemberRole;
use App\Enums\PlanCode;
use App\Enums\SubscriptionStatus;
use App\Enums\UserRole;
use App\Models\Establishment;
use App\Models\Offer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Un compte de démonstration par type de compte (développement uniquement).
 * Mot de passe commun : « password ».
 */
class DemoAccountSeeder extends Seeder
{
    public function run(): void
    {
        $this->user('admin@edumada.test', 'Administrateur Edumada', UserRole::Admin);

        $student = $this->user('etudiant@edumada.test', 'Fanja Rakoto', UserRole::Student, ['city' => 'Antananarivo', 'study_level' => 'BAC']);
        $student->favoriteOffers()->syncWithoutDetaching(
            Offer::whereIn('slug', ['licence-en-informatique-institut-numerique-de-madagascar', 'licence-en-gestion-et-management-ecole-superieure-de-gestion'])->pluck('id'),
        );

        $this->establishmentAccount('gratuit@edumada.test', 'Crèche Les Petits Lémuriens', 'creche-les-petits-lemuriens', null);
        $this->establishmentAccount('pro@edumada.test', 'Institut Numérique de Madagascar', 'institut-numerique-de-madagascar', PlanCode::Pro);
        $this->establishmentAccount('premium@edumada.test', 'Groupe scolaire Les Flamboyants', 'groupe-scolaire-les-flamboyants', PlanCode::Premium);
    }

    /**
     * @param  array<string, string>  $attributes
     */
    private function user(string $email, string $name, UserRole $role, array $attributes = []): User
    {
        $user = User::firstOrNew(['email' => $email]);
        $user->fill(['name' => $name, 'password' => 'password', ...$attributes]);
        $user->role = $role;
        $user->email_verified_at = now();
        $user->save();

        return $user;
    }

    private function establishmentAccount(string $email, string $name, string $slug, ?PlanCode $plan): void
    {
        $establishment = Establishment::where('slug', $slug)->first();
        if (! $establishment) {
            return;
        }

        $user = $this->user($email, "Responsable — {$name}", UserRole::Establishment);
        $establishment->members()->syncWithoutDetaching([$user->id => ['role' => EstablishmentMemberRole::Owner->value]]);

        $establishment->subscriptions()->delete();
        if ($plan) {
            $establishment->subscriptions()->create([
                'plan_id' => Plan::where('code', $plan)->value('id'),
                'status' => SubscriptionStatus::Active,
                'billing_cycle' => BillingCycle::Yearly,
                'starts_at' => now()->startOfMonth(),
                'ends_at' => now()->startOfMonth()->addYear(),
            ]);
        }
    }
}
