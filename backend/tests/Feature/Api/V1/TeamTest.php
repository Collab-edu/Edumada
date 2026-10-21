<?php

namespace Tests\Feature\Api\V1;

use App\Enums\EstablishmentMemberRole;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use App\Notifications\TeamMemberAdded;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
    }

    public function test_owner_adds_a_new_member_who_can_sign_in(): void
    {
        Notification::fake();
        [$owner, $establishment] = $this->establishmentOwner();

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/members", [
            'name' => 'Hery Rabe',
            'email' => 'hery@ecole.mg',
            'jobTitle' => 'Responsable des admissions',
            'role' => 'editor',
            'password' => 'Provisoire2026',
        ])->assertCreated()->assertJsonCount(2, 'data');

        $member = User::where('email', 'hery@ecole.mg')->firstOrFail();
        $this->assertSame(UserRole::Establishment, $member->role);
        $this->assertTrue(Hash::check('Provisoire2026', $member->password));
        $this->assertTrue($member->managesEstablishment($establishment));
        $this->assertFalse($member->ownsEstablishment($establishment));
        Notification::assertSentTo($member, TeamMemberAdded::class, fn (TeamMemberAdded $n) => $n->newAccount);
        $this->assertDatabaseHas('audit_logs', ['action' => 'establishment.member_added']);
    }

    public function test_existing_establishment_account_without_fiche_is_attached(): void
    {
        Notification::fake();
        [$owner, $establishment] = $this->establishmentOwner();
        $member = User::factory()->create(['role' => UserRole::Establishment, 'email' => 'aina@ecole.mg']);

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/members", [
            'email' => 'aina@ecole.mg',
            'role' => 'owner',
        ])->assertCreated();

        $this->assertTrue($member->ownsEstablishment($establishment));
        Notification::assertSentTo($member, TeamMemberAdded::class, fn (TeamMemberAdded $n) => ! $n->newAccount);
    }

    public function test_an_account_cannot_manage_two_establishments(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        [$otherOwner] = $this->establishmentOwner();

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/members", [
            'email' => $otherOwner->email,
            'role' => 'editor',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertFalse($otherOwner->managesEstablishment($establishment));
    }

    public function test_student_accounts_cannot_join_a_team(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $student = $this->student();

        $this->actingAs($owner)->postJson("/api/v1/establishments/{$establishment->slug}/members", [
            'email' => $student->email,
            'role' => 'editor',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_editors_see_the_team_but_cannot_change_it(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $editor = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment->addMember($editor, EstablishmentMemberRole::Editor);

        $this->actingAs($editor)->getJson("/api/v1/establishments/{$establishment->slug}/members")
            ->assertOk()
            ->assertJsonCount(2, 'data');
        $this->actingAs($editor)->postJson("/api/v1/establishments/{$establishment->slug}/members", [
            'name' => 'Intrus', 'email' => 'intrus@ecole.mg', 'role' => 'owner', 'password' => 'Provisoire2026',
        ])->assertForbidden();
        $this->actingAs($editor)->deleteJson("/api/v1/establishments/{$establishment->slug}/members/{$owner->id}")->assertForbidden();
    }

    public function test_outsiders_cannot_list_the_team(): void
    {
        [, $establishment] = $this->establishmentOwner();
        [$stranger] = $this->establishmentOwner();

        $this->actingAs($stranger)->getJson("/api/v1/establishments/{$establishment->slug}/members")->assertForbidden();
    }

    public function test_owner_changes_a_role_and_removes_a_member(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();
        $editor = User::factory()->create(['role' => UserRole::Establishment]);
        $establishment->addMember($editor, EstablishmentMemberRole::Editor);
        $editor->createToken('web');

        $this->actingAs($owner)->putJson("/api/v1/establishments/{$establishment->slug}/members/{$editor->id}", ['role' => 'owner'])->assertOk();
        $this->assertTrue($editor->ownsEstablishment($establishment));

        $this->actingAs($owner)->deleteJson("/api/v1/establishments/{$establishment->slug}/members/{$editor->id}")->assertNoContent();
        $this->assertFalse($editor->managesEstablishment($establishment));
        $this->assertSame(0, $editor->tokens()->count());
    }

    public function test_the_last_owner_cannot_be_removed_or_demoted(): void
    {
        [$owner, $establishment] = $this->establishmentOwner();

        $this->actingAs($owner)->deleteJson("/api/v1/establishments/{$establishment->slug}/members/{$owner->id}")
            ->assertUnprocessable();
        $this->actingAs($owner)->putJson("/api/v1/establishments/{$establishment->slug}/members/{$owner->id}", ['role' => 'editor'])
            ->assertUnprocessable()->assertJsonValidationErrors('role');
        $this->assertTrue($owner->ownsEstablishment($establishment));
    }

    public function test_an_account_with_a_fiche_cannot_create_or_claim_another(): void
    {
        [$owner] = $this->establishmentOwner();
        $other = Establishment::factory()->create();

        $this->actingAs($owner)->postJson('/api/v1/establishments', [
            'name' => 'Deuxième école',
            'type' => 'Privé',
            'category' => Category::factory()->create()->slug,
            'city' => 'Antsirabe',
        ])->assertForbidden();
        $this->actingAs($owner)->postJson("/api/v1/establishments/{$other->slug}/claims", [
            'message' => 'Je dirige aussi cet établissement, joignable au 034 00 000 00.',
        ])->assertUnprocessable();
    }
}
