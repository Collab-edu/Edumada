<?php

namespace Database\Factories;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentSector;
use App\Enums\EstablishmentStatus;
use App\Enums\VerificationStatus;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Establishment>
 */
class EstablishmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'Institut '.fake()->unique()->lastName();

        return [
            'slug' => Str::slug($name),
            'name' => $name,
            'sector' => EstablishmentSector::Private,
            'category_id' => Category::factory(),
            'city' => 'Antananarivo',
            'address' => fake()->streetAddress(),
            'phone' => '+261 34 00 000 00',
            'email' => fake()->safeEmail(),
            'description' => fake()->sentence(),
            'status' => EstablishmentStatus::Published,
            'verification_status' => VerificationStatus::Unverified,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => EstablishmentStatus::PendingReview]);
    }

    public function ownedBy(User $user): static
    {
        return $this->hasAttached($user, ['role' => EstablishmentMemberRole::Owner->value], 'members');
    }
}
