<?php

namespace Tests;

use App\Enums\BillingCycle;
use App\Enums\PlanCode;
use App\Enums\SubscriptionStatus;
use App\Enums\UserRole;
use App\Models\Establishment;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Compte établissement propriétaire d'une fiche publiée, à la formule demandée
     * (les formules doivent être en base : PlanSeeder).
     *
     * @return array{0: User, 1: Establishment}
     */
    protected function establishmentOwner(PlanCode $plan = PlanCode::Free): array
    {
        $owner = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment = Establishment::factory()->ownedBy($owner)->create(['email' => 'contact@etablissement.mg']);

        if ($plan !== PlanCode::Free) {
            $this->subscribe($establishment, $plan);
        }

        return [$owner, $establishment];
    }

    protected function subscribe(Establishment $establishment, PlanCode $plan, ?\DateTimeInterface $endsAt = null): void
    {
        $establishment->subscriptions()->create([
            'plan_id' => Plan::firstWhere('code', $plan)->id,
            'status' => SubscriptionStatus::Active,
            'billing_cycle' => BillingCycle::Yearly,
            'starts_at' => now()->subDay(),
            'ends_at' => $endsAt ?? now()->addYear(),
        ]);
    }

    protected function student(): User
    {
        return User::factory()->create(['role' => UserRole::Student, 'name' => 'Fanja Rakoto']);
    }

    protected function admin(): User
    {
        return User::factory()->create(['role' => UserRole::Admin]);
    }
}
