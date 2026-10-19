<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class RegisteredUserControllerTest extends TestCase
{
    use RefreshDatabase;

    #[TestWith(['student'])]
    #[TestWith(['establishment'])]
    public function test_creates_account_of_requested_type_and_returns_201_with_token(string $accountType): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Fanja Rakoto',
            'email' => 'fanja@example.mg',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => $accountType,
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'fanja@example.mg')
            ->assertJsonPath('user.role', $accountType)
            ->assertJsonStructure(['token']);
        $this->assertSame(UserRole::from($accountType), User::firstWhere('email', 'fanja@example.mg')->role);
    }

    public function test_establishment_signup_creates_fiche_pending_review_owned_by_the_account(): void
    {
        $category = Category::factory()->create(['slug' => 'formation-pro']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Hery Randria',
            'firstName' => 'Hery',
            'lastName' => 'Randria',
            'jobTitle' => 'Responsable des admissions',
            'email' => 'hery@institut.mg',
            'phone' => '034 00 000 00',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => 'establishment',
            'plan' => 'pro',
            'billingCycle' => 'yearly',
            'establishment' => [
                'name' => 'Institut des Métiers de Toliara',
                'category' => 'formation-pro',
                'city' => 'Toliara',
                'email' => 'contact@institut.mg',
                'website' => 'https://institut.mg',
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.jobTitle', 'Responsable des admissions')
            ->assertJsonPath('user.establishments.0.name', 'Institut des Métiers de Toliara')
            ->assertJsonPath('user.establishments.0.role', EstablishmentMemberRole::Owner->value);

        $establishment = Establishment::firstWhere('name', 'Institut des Métiers de Toliara');
        $this->assertSame(EstablishmentStatus::PendingReview, $establishment->status);
        $this->assertSame($category->id, $establishment->category_id);
        $this->assertNull($establishment->sector);
        $this->assertSame('https://institut.mg', $establishment->website);
        $this->assertSame('pro', $establishment->requested_plan);
        $this->assertSame('yearly', $establishment->requested_billing_cycle);
    }

    public function test_establishment_signup_requires_manager_details_and_valid_category(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Hery Randria',
            'email' => 'hery@institut.mg',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => 'establishment',
            'establishment' => ['name' => 'Institut', 'category' => 'inconnue', 'city' => 'Toliara'],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['firstName', 'lastName', 'jobTitle', 'phone', 'establishment.category']);
        $this->assertDatabaseMissing('users', ['email' => 'hery@institut.mg']);
    }

    public function test_student_cannot_attach_an_establishment(): void
    {
        Category::factory()->create(['slug' => 'formation-pro']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Fanja Rakoto',
            'email' => 'fanja@example.mg',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => 'student',
            'establishment' => ['name' => 'Institut', 'category' => 'formation-pro', 'city' => 'Toliara'],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('establishment');
        $this->assertDatabaseCount('establishments', 0);
    }

    public function test_rejects_admin_account_type_with_422(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Intrus',
            'email' => 'intrus@example.mg',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'accountType' => 'admin',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('accountType');
        $this->assertDatabaseMissing('users', ['email' => 'intrus@example.mg']);
    }
}
