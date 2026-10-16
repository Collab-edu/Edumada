<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'établissement d'une nouvelle demande. Avec la formule Gratuit, l'e-mail contient
 * la demande complète (réception simple) ; avec Pro et Premium, il renvoie vers la boîte de réception.
 */
class NewInquiryReceived extends Notification
{
    use Queueable;

    public function __construct(public Inquiry $inquiry, public bool $hasInbox) {}

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
        $subject = $inquiry->offer ? " — {$inquiry->offer->title}" : '';

        $mail = (new MailMessage)
            ->subject("{$inquiry->type->label()} reçue sur Edumada{$subject}")
            ->greeting('Bonjour,')
            ->line("{$inquiry->name} vous a envoyé une ".mb_strtolower($inquiry->type->label()).($inquiry->offer ? " pour « {$inquiry->offer->title} »." : '.'));

        if ($this->hasInbox) {
            return $mail
                ->action('Ouvrir la boîte de réception', rtrim(config('edumada.backoffice_url'), '/').'/#/demandes?e='.$inquiry->establishment->slug)
                ->line('Répondez rapidement : le délai de première réponse compte pour les futurs étudiants.');
        }

        return $mail
            ->line('E-mail : '.$inquiry->email)
            ->line('Téléphone : '.($inquiry->phone ?: 'non communiqué'))
            ->line('Message : '.($inquiry->message ?: '—'))
            ->line('Répondez directement à cette personne. Les formules Pro et Premium ajoutent une boîte de réception avec suivi des statuts.');
    }
}
