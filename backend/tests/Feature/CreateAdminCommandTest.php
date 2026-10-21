<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_the_admin_account(): void
    {
        $this->artisan('edumada:admin', ['--email' => 'admin@edumada.mg', '--password' => 'Admin2026secret'])
            ->assertSuccessful();

        $admin = User::where('email', 'admin@edumada.mg')->firstOrFail();
        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue(Hash::check('Admin2026secret', $admin->password));
    }

    public function test_an_existing_account_keeps_its_password(): void
    {
        $user = User::factory()->create(['email' => 'admin@edumada.mg', 'password' => 'Ancien2026', 'role' => UserRole::Student]);

        $this->artisan('edumada:admin', ['--email' => 'admin@edumada.mg', '--password' => 'Nouveau2026'])->assertSuccessful();

        $user->refresh();
        $this->assertSame(UserRole::Admin, $user->role);
        $this->assertTrue(Hash::check('Ancien2026', $user->password));
    }

    public function test_a_weak_password_is_refused(): void
    {
        $this->artisan('edumada:admin', ['--email' => 'admin@edumada.mg', '--password' => 'court'])->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'admin@edumada.mg']);
    }
}
