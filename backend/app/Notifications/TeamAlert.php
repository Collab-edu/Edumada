<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Alerte envoyée à l'équipe Edumada quand une action attend un traitement dans le back-office :
 * nouvel établissement à valider, revendication de fiche, demande de vérification, candidature à un stage.
 */
class TeamAlert extends Notification
{
    use Queueable;

    /**
     * @param  array<int, string>  $lines
     * @param  string  $path  Page du back-office à ouvrir, ex. « /admin/moderation/ ».
     */
    public function __construct(public string $subject, public array $lines, public string $actionText, public string $path) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)->subject($this->subject)->greeting('Bonjour,');
        foreach ($this->lines as $line) {
            $mail->line($line);
        }

        return $mail->action($this->actionText, rtrim(config('edumada.backoffice_url'), '/').$this->path);
    }
}
