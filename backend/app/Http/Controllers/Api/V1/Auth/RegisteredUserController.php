<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;

class RegisteredUserController extends Controller
{
    /**
     * Crée un compte étudiant ou établissement et renvoie un jeton d'accès.
     */
    public function store(RegisterRequest $request): JsonResponse
    {
        $user = new User([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'phone' => $request->validated('phone'),
            'city' => $request->validated('city'),
            'study_level' => $request->validated('studyLevel'),
        ]);
        $user->role = UserRole::from($request->validated('accountType'));
        $user->save();

        event(new Registered($user));

        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => new UserResource($user->load('establishments')),
        ], 201);
    }
}
