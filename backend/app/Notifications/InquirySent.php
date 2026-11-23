<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Copie envoyée à l'étudiant de la demande ou de la candidature qu'il vient d'adresser à un établissement.
 */
class InquirySent extends Notification
{
    use Queueable;

    public function __construct(public Inquiry $inquiry) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $inquiry = $this->inquiry;
        $kind = mb_strtolower($inquiry->type->label());
        $about = $inquiry->offer ? " pour « {$inquiry->offer->title} »" : '';

        return (new MailMessage)
            ->subject("Votre {$kind} a été envoyée à {$inquiry->establishment->name}")
            ->greeting("Bonjour {$inquiry->name},")
            ->line("Votre {$kind}{$about} a bien été transmise à {$inquiry->establishment->name}.")
            ->line('L’établissement vous répondra directement. Vous recevrez un e-mail à chaque réponse ou changement de statut.')
            ->line('Votre message : '.($inquiry->message ?: '—'))
            ->action('Suivre ma demande', rtrim(config('edumada.frontend_url'), '/').'/espace/etudiant/')
            ->line('Cet e-mail est envoyé automatiquement : merci de ne pas y répondre.');
    }
}
