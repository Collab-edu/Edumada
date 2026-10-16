<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'étudiant que le statut de sa demande ou candidature a changé.
 */
class InquiryStatusChanged extends Notification
{
    use Queueable;

    public function __construct(public Inquiry $inquiry, public ?string $note = null) {}

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
        $mail = (new MailMessage)
            ->subject("Votre {$inquiry->type->label()} : {$inquiry->status->label()}")
            ->greeting("Bonjour {$inquiry->name},")
            ->line("{$inquiry->establishment->name} a mis à jour votre ".mb_strtolower($inquiry->type->label()).($inquiry->offer ? " pour « {$inquiry->offer->title} »" : '').'.')
            ->line("Nouveau statut : {$inquiry->status->label()}.");

        if ($this->note) {
            $mail->line("Message de l'établissement : {$this->note}");
        }

        return $mail->action('Suivre mes démarches', rtrim(config('edumada.frontend_url'), '/').'/espace/etudiant/');
    }
}
