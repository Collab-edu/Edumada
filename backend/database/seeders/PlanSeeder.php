<?php

namespace Database\Seeders;

use App\Enums\PlanCode;
use App\Models\Plan;
use Illuminate\Database\Seeder;

/**
 * Formules établissement. Prix = hypothèses de travail du document de cadrage
 * (Pro 50 000–100 000 Ar/mois ou ~600 000 Ar/an ; Premium 150 000–200 000 Ar/mois),
 * à valider auprès d'établissements malgaches.
 */
class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'code' => PlanCode::Free,
                'name' => 'Gratuit',
                'monthly_price' => 0,
                'yearly_price' => 0,
                'max_published_offers' => 1,
                'features' => [
                    'inquiryInbox' => false, 'statistics' => 'none', 'sponsoredPlacement' => false, 'prioritySupport' => false,
                    'photoGallery' => false, 'onlineLinks' => false, 'reviews' => false, 'maxInfrastructures' => 0,
                ],
            ],
            [
                'code' => PlanCode::Pro,
                'name' => 'Pro',
                'monthly_price' => 75000,
                'yearly_price' => 600000,
                'max_published_offers' => null,
                'features' => [
                    'inquiryInbox' => true, 'statistics' => 'standard', 'sponsoredPlacement' => false, 'prioritySupport' => false,
                    'photoGallery' => true, 'onlineLinks' => true, 'reviews' => true, 'maxInfrastructures' => null,
                ],
            ],
            [
                'code' => PlanCode::Premium,
                'name' => 'Premium',
                'monthly_price' => 175000,
                'yearly_price' => null,
                'max_published_offers' => null,
                'features' => [
                    'inquiryInbox' => true, 'statistics' => 'advanced', 'sponsoredPlacement' => true, 'prioritySupport' => true,
                    'photoGallery' => true, 'onlineLinks' => true, 'reviews' => true, 'maxInfrastructures' => null,
                ],
            ],
        ];

        foreach ($plans as $position => $plan) {
            Plan::updateOrCreate(['code' => $plan['code']], [...$plan, 'position' => $position]);
        }
    }
}
