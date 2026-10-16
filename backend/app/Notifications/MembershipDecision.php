<?php

namespace App\Notifications;

use App\Models\Establishment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Réponse d'Edumada à une demande d'adhésion (nouvelle fiche en attente de validation).
 */
class MembershipDecision extends Notification
{
    use Queueable;

    public function __construct(public Establishment $establishment, public bool $accepted, public ?string $note = null) {}

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
        $url = rtrim(config('edumada.backoffice_url'), '/').'/fiche/?e='.$this->establishment->slug;
        $mail = (new MailMessage)->greeting('Bonjour,');

        if ($this->accepted) {
            $mail->subject("Bienvenue sur Edumada : {$name} est en ligne")
                ->line("L'adhésion de {$name} a été acceptée : la fiche est maintenant visible sur Edumada.")
                ->line('Ajoutez vos offres pour apparaître dans les recherches des étudiants.');
        } else {
            $mail->subject("Votre demande d'adhésion pour {$name}")
                ->line("La fiche de {$name} n'a pas pu être publiée pour le moment.");
        }

        if ($this->note) {
            $mail->line("Message de l'équipe Edumada : {$this->note}");
        }

        return $mail->action($this->accepted ? 'Gérer ma fiche' : 'Compléter ma fiche', $url);
    }
}
