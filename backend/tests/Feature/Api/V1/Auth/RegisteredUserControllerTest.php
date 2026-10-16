<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Enums\UserRole;
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
