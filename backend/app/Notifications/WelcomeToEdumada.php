<?php

namespace App\Notifications;

use App\Models\Establishment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mail de bienvenue après la création d'un compte : étudiant, ou établissement dont la fiche
 * attend la validation de l'équipe.
 */
class WelcomeToEdumada extends Notification
{
    use Queueable;

    public function __construct(public ?Establishment $establishment = null) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)->greeting("Bonjour {$notifiable->name},");

        if ($this->establishment) {
            return $mail
                ->subject("Bienvenue sur Edumada : la fiche de {$this->establishment->name} est en cours de vérification")
                ->line("Votre compte est créé et la fiche de {$this->establishment->name} a bien été reçue.")
                ->line('L’équipe Edumada la vérifie avant sa publication. En attendant, complétez-la : présentation, photos, coordonnées et offres.')
                ->action('Compléter ma fiche', rtrim(config('edumada.backoffice_url'), '/').'/fiche/?e='.$this->establishment->slug)
                ->line('Cet e-mail est envoyé automatiquement. Pour toute question, écrivez à contact@edumada.mg.');
        }

        return $mail
            ->subject('Bienvenue sur Edumada')
            ->line('Votre compte étudiant est créé.')
            ->line('Enregistrez les formations qui vous intéressent, contactez les établissements et suivez vos demandes depuis votre espace.')
            ->action('Trouver une formation', rtrim(config('edumada.frontend_url'), '/').'/recherche/')
            ->line('Cet e-mail est envoyé automatiquement. Pour toute question, écrivez à contact@edumada.mg.');
    }
}
