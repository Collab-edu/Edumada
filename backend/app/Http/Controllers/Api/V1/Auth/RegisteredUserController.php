<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegisteredUserController extends Controller
{
    /**
     * Crée un compte étudiant ou établissement et renvoie un jeton d'accès.
     * Un établissement peut joindre sa fiche minimale : elle est créée en attente de validation
     * et rattachée au compte, qui la complète ensuite dans le back-office.
     */
    public function store(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = new User([
                'name' => $request->validated('name'),
                'first_name' => $request->validated('firstName'),
                'last_name' => $request->validated('lastName'),
                'job_title' => $request->validated('jobTitle'),
                'email' => $request->validated('email'),
                'password' => $request->validated('password'),
                'phone' => $request->validated('phone'),
                'city' => $request->validated('city'),
                'study_level' => $request->validated('studyLevel'),
            ]);
            $user->role = UserRole::from($request->validated('accountType'));
            $user->save();

            if ($data = $request->validated('establishment')) {
                $establishment = new Establishment([
                    'name' => $data['name'],
                    'category_id' => Category::where('slug', $data['category'])->value('id'),
                    'city' => $data['city'],
                    'email' => $data['email'] ?? null,
                    'website' => $data['website'] ?? null,
                ]);
                $establishment->slug = Establishment::uniqueSlug($establishment->name);
                $establishment->status = EstablishmentStatus::PendingReview;
                $establishment->verification_status = VerificationStatus::Unverified;
                if (in_array($request->validated('plan'), ['pro', 'premium'], true)) {
                    $establishment->requested_plan = $request->validated('plan');
                    $establishment->requested_billing_cycle = $request->validated('billingCycle') ?? 'monthly';
                }
                $establishment->save();
                $establishment->members()->attach($user, ['role' => EstablishmentMemberRole::Owner->value]);
            }

            return $user;
        });

        event(new Registered($user));

        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => new UserResource($user->load('establishments')),
        ], 201);
    }
}
