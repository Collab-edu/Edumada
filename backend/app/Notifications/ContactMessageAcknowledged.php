<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Accusé de réception envoyé au visiteur qui a écrit depuis la page Contact.
 */
class ContactMessageAcknowledged extends Notification
{
    use Queueable;

    public function __construct(public ContactMessage $contact) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nous avons bien reçu votre message')
            ->greeting("Bonjour {$this->contact->name},")
            ->line('Merci pour votre message : l’équipe Edumada l’a bien reçu et vous répondra rapidement, en général sous 48 heures.')
            ->line('Votre message :')
            ->line($this->contact->message)
            ->line('Pour compléter votre demande, écrivez à contact@edumada.mg. Cet e-mail est envoyé automatiquement : merci de ne pas y répondre.');
    }
}
