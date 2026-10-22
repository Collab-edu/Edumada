<?php

namespace App\Notifications;

use App\Enums\UserRole;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Lien de réinitialisation du mot de passe. Il mène au site (étudiants) ou au back-office
 * (établissements, administration), là où la personne se connecte habituellement.
 */
class ResetPasswordLink extends Notification
{
    use Queueable;

    public function __construct(public string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function url(object $notifiable): string
    {
        $base = $notifiable->role === UserRole::Student ? config('edumada.frontend_url') : config('edumada.backoffice_url');

        return rtrim($base, '/').'/reinitialiser-mot-de-passe/?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $minutes = config('auth.passwords.users.expire');

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe Edumada')
            ->greeting('Bonjour,')
            ->line('Vous avez demandé à réinitialiser le mot de passe de votre compte Edumada.')
            ->action('Choisir un nouveau mot de passe', $this->url($notifiable))
            ->line("Ce lien est valable {$minutes} minutes et ne peut servir qu'une fois.")
            ->line('Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.');
    }
}
