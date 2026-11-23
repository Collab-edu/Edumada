<?php

namespace App\Notifications;

use App\Models\InternshipApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Confirmation envoyée à l'étudiant après sa candidature à une offre de stage.
 */
class InternshipApplicationReceived extends Notification
{
    use Queueable;

    public function __construct(public InternshipApplication $application) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $internship = $this->application->internship;

        return (new MailMessage)
            ->subject("Candidature reçue : {$internship->title}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre candidature au stage « {$internship->title} » chez {$internship->company_name} a bien été reçue, avec votre CV et votre lettre de motivation.")
            ->line('L’équipe Edumada étudie votre dossier et vous contactera si votre profil est retenu.')
            ->action('Voir mes candidatures', rtrim(config('edumada.frontend_url'), '/').'/espace/etudiant/')
            ->line('Cet e-mail est envoyé automatiquement : merci de ne pas y répondre.');
    }
}
