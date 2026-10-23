<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Enums\EstablishmentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.google.client_id' => 'edumada-test.apps.googleusercontent.com']);
    }

    /**
     * Réponse de Google pour un jeton valable (sauf modification).
     */
    private function google(array $claims = []): void
    {
        Http::fake(['oauth2.googleapis.com/*' => Http::response([
            'aud' => 'edumada-test.apps.googleusercontent.com',
            'iss' => 'https://accounts.google.com',
            'email' => 'Direction@Institut.mg',
            'email_verified' => 'true',
            'exp' => (string) (time() + 3600),
            'name' => 'Hery Rabe',
            'given_name' => 'Hery',
            'family_name' => 'Rabe',
            ...$claims,
        ])]);
    }

    private function signup(array $overrides = []): array
    {
        return [
            'googleCredential' => 'jeton-google',
            'accountType' => 'establishment',
            'name' => 'Hery Rabe',
            'firstName' => 'Hery',
            'lastName' => 'Rabe',
            'jobTitle' => 'Directeur ou directrice',
            'phone' => '034 00 000 00',
            'establishment' => ['name' => 'Institut Avenir', 'category' => 'superieur', 'city' => 'Antananarivo'],
            ...$overrides,
        ];
    }

    public function test_establishment_signs_up_with_google_without_password(): void
    {
        Category::factory()->create(['slug' => 'superieur']);
        $this->google();

        $this->postJson('/api/v1/auth/register', $this->signup())
            ->assertCreated()
            ->assertJsonPath('user.email', 'direction@institut.mg')
            ->assertJsonPath('user.role', 'establishment')
            ->assertJsonStructure(['token']);

        $user = User::firstWhere('email', 'direction@institut.mg');
        $this->assertNotNull($user->email_verified_at);
        $this->assertSame(EstablishmentStatus::PendingReview, $user->establishments()->first()->status);
    }

    public function test_google_signup_rejects_a_token_made_for_another_application(): void
    {
        Category::factory()->create(['slug' => 'superieur']);
        $this->google(['aud' => 'autre-application.apps.googleusercontent.com']);

        $this->postJson('/api/v1/auth/register', $this->signup())->assertUnprocessable()->assertJsonValidationErrors('googleCredential');
        $this->assertDatabaseCount('users', 0);
    }

    public function test_google_signup_with_an_existing_address_asks_to_log_in(): void
    {
        Category::factory()->create(['slug' => 'superieur']);
        User::factory()->create(['email' => 'direction@institut.mg']);
        $this->google();

        $this->postJson('/api/v1/auth/register', $this->signup())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['googleCredential' => 'connectez-vous']);
    }

    public function test_students_cannot_sign_up_with_google(): void
    {
        $this->google();

        $this->postJson('/api/v1/auth/register', $this->signup(['accountType' => 'student', 'establishment' => null]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('googleCredential');
    }

    public function test_existing_account_logs_in_with_google(): void
    {
        $user = User::factory()->create(['email' => 'direction@institut.mg', 'email_verified_at' => null]);
        $user->role = UserRole::Establishment;
        $user->save();
        $this->google();

        $this->postJson('/api/v1/auth/google', ['credential' => 'jeton-google'])
            ->assertOk()
            ->assertJsonPath('user.email', 'direction@institut.mg')
            ->assertJsonStructure(['token']);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_google_login_without_account_fails(): void
    {
        $this->google();

        $this->postJson('/api/v1/auth/google', ['credential' => 'jeton-google'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['credential' => 'Aucun compte']);
    }

    public function test_google_login_with_an_unconfirmed_google_address_fails(): void
    {
        User::factory()->create(['email' => 'direction@institut.mg']);
        $this->google(['email_verified' => 'false']);

        $this->postJson('/api/v1/auth/google', ['credential' => 'jeton-google'])->assertUnprocessable()->assertJsonValidationErrors('credential');
    }

    public function test_google_is_unavailable_until_configured(): void
    {
        config(['services.google.client_id' => null]);

        $this->postJson('/api/v1/auth/google', ['credential' => 'jeton-google'])->assertStatus(503);
    }
}
