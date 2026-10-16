<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Formulaire de la page Contact, ouvert à tous les visiteurs.
 */
class ContactController extends Controller
{
    /**
     * Sujets proposés dans la liste « Objet de votre message ».
     */
    public const SUBJECTS = ['orientation', 'establishment', 'account', 'partnership', 'other'];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+().\s-]{6,30}$/'],
            'subject' => ['required', Rule::in(self::SUBJECTS)],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        ContactMessage::create([...$validated, 'user_id' => $request->user('sanctum')?->id]);

        return response()->json(['message' => 'Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.'], 201);
    }
}
