<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'équipe Edumada d'un message envoyé depuis la page Contact.
 * « Répondre » dans la messagerie écrit directement au visiteur.
 */
class ContactMessageReceived extends Notification
{
    use Queueable;

    /**
     * Libellés des sujets, les mêmes que la liste « Objet de votre message » du site.
     */
    public const SUBJECT_LABELS = [
        'orientation' => 'Choisir une formation ou une école',
        'establishment' => 'Référencer mon établissement',
        'account' => 'Mon compte Edumada',
        'partnership' => 'Partenariat',
        'other' => 'Autre',
    ];

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
        $contact = $this->contact;
        $subject = self::SUBJECT_LABELS[$contact->subject] ?? $contact->subject;

        return (new MailMessage)
            ->subject("Message du site — {$subject}")
            ->replyTo($contact->email, $contact->name)
            ->greeting('Nouveau message depuis la page Contact')
            ->line("De : {$contact->name} ({$contact->email})")
            ->line('Téléphone : '.($contact->phone ?: 'non communiqué'))
            ->line("Objet : {$subject}")
            ->line('Message :')
            ->line($contact->message)
            ->line('Répondez directement à cet e-mail pour écrire à cette personne.');
    }
}
