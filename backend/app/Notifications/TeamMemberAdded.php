<?php

namespace App\Notifications;

use App\Models\Establishment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Prévient une personne qu'elle a été ajoutée à l'équipe d'un établissement sur Edumada.
 */
class TeamMemberAdded extends Notification
{
    use Queueable;

    public function __construct(public Establishment $establishment, public string $invitedBy, public bool $newAccount) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = $this->establishment->name;
        $url = rtrim(config('edumada.backoffice_url'), '/').'/connexion/?email='.urlencode($notifiable->email);

        $mail = (new MailMessage)
            ->subject("Vous avez rejoint l'équipe de {$name} sur Edumada")
            ->greeting('Bonjour,')
            ->line("{$this->invitedBy} vous a ajouté(e) à l'équipe qui gère la fiche de {$name} sur Edumada.");

        if ($this->newAccount) {
            $mail->line("Un compte a été créé à votre adresse. {$this->invitedBy} vous communiquera votre mot de passe provisoire : changez-le dès votre première connexion, depuis « Mon compte ».");
        }

        return $mail->action('Se connecter au back-office', $url);
    }
}
