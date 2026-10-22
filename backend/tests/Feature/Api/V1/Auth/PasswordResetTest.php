<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Enums\UserRole;
use App\Models\User;
use App\Notifications\ResetPasswordLink;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_student_receives_a_link_to_the_site(): void
    {
        Notification::fake();
        $student = User::factory()->create(['role' => UserRole::Student, 'email' => 'aina@exemple.mg']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'aina@exemple.mg'])->assertOk();

        Notification::assertSentTo($student, ResetPasswordLink::class, function (ResetPasswordLink $notice) use ($student) {
            return str_starts_with($notice->url($student), rtrim(config('edumada.frontend_url'), '/').'/reinitialiser-mot-de-passe/');
        });
    }

    public function test_an_establishment_account_receives_a_link_to_the_backoffice(): void
    {
        Notification::fake();
        $manager = User::factory()->create(['role' => UserRole::Establishment]);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $manager->email])->assertOk();

        Notification::assertSentTo($manager, ResetPasswordLink::class, function (ResetPasswordLink $notice) use ($manager) {
            return str_starts_with($notice->url($manager), rtrim(config('edumada.backoffice_url'), '/').'/reinitialiser-mot-de-passe/');
        });
    }

    public function test_an_unknown_address_gets_the_same_answer(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'inconnu@exemple.mg'])
            ->assertOk()
            ->assertJsonPath('message', fn (string $message) => str_starts_with($message, 'Si un compte existe'));

        Notification::assertNothingSent();
    }

    public function test_the_link_sets_a_new_password_and_closes_other_sessions(): void
    {
        $user = User::factory()->create(['password' => 'Ancien2026']);
        $user->createToken('web');
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'Nouveau2026',
            'password_confirmation' => 'Nouveau2026',
        ])->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('Nouveau2026', $user->password));
        $this->assertSame(0, $user->tokens()->count());

        // Le lien ne sert qu'une fois.
        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'Encore2026',
            'password_confirmation' => 'Encore2026',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');
    }

    public function test_a_wrong_token_or_weak_password_is_refused(): void
    {
        $user = User::factory()->create(['password' => 'Ancien2026']);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'faux-jeton',
            'email' => $user->email,
            'password' => 'Nouveau2026',
            'password_confirmation' => 'Nouveau2026',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => Password::createToken($user),
            'email' => $user->email,
            'password' => 'court',
            'password_confirmation' => 'court',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->assertTrue(Hash::check('Ancien2026', $user->refresh()->password));
    }
}
