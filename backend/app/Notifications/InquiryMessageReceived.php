<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Nouveau message dans une demande d'information.
 */
class InquiryMessageReceived extends Notification
{
    use Queueable;

    public function __construct(public Inquiry $inquiry, public string $body, public bool $fromStudent, public bool $hasInbox) {}

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

        if (! $this->fromStudent) {
            return (new MailMessage)
                ->subject("Réponse de {$inquiry->establishment->name}{$subject}")
                ->greeting("Bonjour {$inquiry->name},")
                ->line("{$inquiry->establishment->name} a répondu à votre demande :")
                ->line($this->body)
                ->action('Lire et répondre', rtrim(config('edumada.frontend_url'), '/').'/espace/etudiant/');
        }

        $mail = (new MailMessage)
            ->subject("Nouveau message de {$inquiry->name}{$subject}")
            ->greeting('Bonjour,')
            ->line("{$inquiry->name} vous a écrit :")
            ->line($this->body);

        if ($this->hasInbox) {
            return $mail->action('Répondre', rtrim(config('edumada.backoffice_url'), '/')."/demandes/?id={$inquiry->id}&e={$inquiry->establishment->slug}");
        }

        return $mail
            ->line('E-mail : '.$inquiry->email)
            ->line('Téléphone : '.($inquiry->phone ?: 'non communiqué'))
            ->line('Répondez directement à cette personne.');
    }
}
