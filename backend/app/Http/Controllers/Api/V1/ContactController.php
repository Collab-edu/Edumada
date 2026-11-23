<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Notifications\ContactMessageReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
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

        $contact = ContactMessage::create([...$validated, 'user_id' => $request->user('sanctum')?->id]);

        // Copie par e-mail à l'équipe (contact@edumada.mg) ; le message reste enregistré même si l'envoi échoue.
        try {
            Notification::route('mail', config('edumada.contact_email'))->notify(new ContactMessageReceived($contact));
        } catch (\Throwable $e) {
            Log::warning('E-mail du formulaire de contact non envoyé', ['contact_message_id' => $contact->id, 'error' => $e->getMessage()]);
        }

        return response()->json(['message' => 'Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.'], 201);
    }
}
