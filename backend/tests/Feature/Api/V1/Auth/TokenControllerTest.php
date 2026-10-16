<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TokenControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_credentials_return_a_token_that_authenticates_requests(): void
    {
        $user = User::factory()->create(['email' => 'fanja@example.mg']);

        $token = $this->postJson('/api/v1/auth/login', ['email' => 'fanja@example.mg', 'password' => 'password'])
            ->assertOk()
            ->json('token');

        $this->withToken($token)->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_wrong_password_returns_422_with_french_message(): void
    {
        User::factory()->create(['email' => 'fanja@example.mg']);

        $this->postJson('/api/v1/auth/login', ['email' => 'fanja@example.mg', 'password' => 'mauvais'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'Ces identifiants ne correspondent à aucun compte.']);
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_returns_401_without_token(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }
}
