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
use App\Services\GoogleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Crée un compte étudiant ou établissement et renvoie un jeton d'accès.
     * Un établissement peut joindre sa fiche minimale : elle est créée en attente de validation
     * et rattachée au compte, qui la complète ensuite dans le back-office.
     * Avec googleCredential, l'adresse vient du compte Google (déjà confirmée) et aucun mot de
     * passe n'est choisi : la personne se connecte avec Google, ou en crée un via « Mot de passe oublié ».
     */
    public function store(RegisterRequest $request, GoogleIdToken $google): JsonResponse
    {
        $googleAccount = null;
        if ($request->filled('googleCredential')) {
            abort_unless($google->enabled(), 503, "L'inscription avec Google n'est pas encore activée.");
            $googleAccount = $google->verify($request->validated('googleCredential'))
                ?? throw ValidationException::withMessages(['googleCredential' => 'La connexion avec Google a échoué. Réessayez.']);
            if (User::where('email', $googleAccount['email'])->exists()) {
                throw ValidationException::withMessages(['googleCredential' => 'Un compte existe déjà avec cette adresse Google : connectez-vous.']);
            }
        }

        $user = DB::transaction(function () use ($request, $googleAccount): User {
            $user = new User([
                'name' => $request->validated('name'),
                'first_name' => $request->validated('firstName'),
                'last_name' => $request->validated('lastName'),
                'job_title' => $request->validated('jobTitle'),
                'email' => $googleAccount['email'] ?? $request->validated('email'),
                'password' => $request->validated('password') ?? Str::password(32),
                'phone' => $request->validated('phone'),
                'city' => $request->validated('city'),
                'study_level' => $request->validated('studyLevel'),
            ]);
            $user->role = UserRole::from($request->validated('accountType'));
            if ($googleAccount) {
                $user->email_verified_at = now();
            }
            $user->save();

            if ($data = $request->validated('establishment')) {
                $establishment = new Establishment([
                    'name' => $data['name'],
                    'category_id' => Category::where('slug', $data['category'])->value('id'),
                    'city' => $data['city'],
                    'email' => $data['email'] ?? null,
                    'website' => $data['website'] ?? null,
                ]);
                // Position approximative (celle de la localité), à préciser ensuite dans la fiche.
                if (isset($data['coordinates'])) {
                    $establishment->latitude = $data['coordinates']['lat'];
                    $establishment->longitude = $data['coordinates']['lng'];
                }
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
