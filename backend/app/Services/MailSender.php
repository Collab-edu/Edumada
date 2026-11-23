<?php

namespace App\Services;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification as Notifier;

/**
 * Envoi des e-mails d'information (accusés de réception, alertes de l'équipe).
 * Une panne de messagerie ne doit jamais faire échouer l'action de la personne :
 * l'erreur est seulement journalisée.
 */
class MailSender
{
    /**
     * Prévient l'équipe Edumada (adresse CONTACT_EMAIL, par défaut contact@edumada.mg).
     */
    public static function toTeam(Notification $notification): void
    {
        self::attempt(fn () => Notifier::route('mail', config('edumada.contact_email'))->notify($notification), $notification);
    }

    /**
     * Écrit à un utilisateur, ou à une simple adresse e-mail (visiteur sans compte).
     */
    public static function to(object|string $recipient, Notification $notification): void
    {
        self::attempt(
            fn () => is_string($recipient) ? Notifier::route('mail', $recipient)->notify($notification) : Notifier::send($recipient, $notification),
            $notification,
        );
    }

    private static function attempt(callable $send, Notification $notification): void
    {
        try {
            $send();
        } catch (\Throwable $e) {
            Log::warning('E-mail non envoyé', ['notification' => $notification::class, 'error' => $e->getMessage()]);
        }
    }
}
