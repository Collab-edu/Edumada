<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mails liés à l'abonnement : activation, rappels d'expiration (J-30, J-7, J-1), expiration.
 */
class SubscriptionNotice extends Notification
{
    use Queueable;

    public const ACTIVATED = 'activated';

    public const EXPIRING = 'expiring';

    public const EXPIRED = 'expired';

    public function __construct(public Subscription $subscription, public string $kind, public ?int $daysLeft = null) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subscription = $this->subscription;
        $plan = $subscription->plan->name;
        $establishment = $subscription->establishment->name;
        $endDate = $subscription->ends_at?->locale('fr')->isoFormat('LL');
        $billingUrl = rtrim(config('edumada.frontend_url'), '/').'/espace/etablissement/formule/?e='.$subscription->establishment->slug;

        $mail = (new MailMessage)->greeting('Bonjour,');

        return match ($this->kind) {
            self::ACTIVATED => $mail
                ->subject("Formule {$plan} activée pour {$establishment}")
                ->line("Votre paiement a été confirmé : la formule {$plan} est active".($endDate ? " jusqu'au {$endDate}" : '').'.')
                ->action('Voir ma formule', $billingUrl),
            self::EXPIRING => $mail
                ->subject("Votre formule {$plan} expire dans {$this->daysLeft} jour".($this->daysLeft > 1 ? 's' : ''))
                ->line("La formule {$plan} de {$establishment} expire le {$endDate}.")
                ->line('Sans renouvellement, les fonctions payantes seront suspendues ; votre fiche restera en ligne.')
                ->action('Renouveler', $billingUrl),
            default => $mail
                ->subject("Votre formule {$plan} a expiré")
                ->line("La formule {$plan} de {$establishment} a expiré. Votre fiche reste en ligne avec la formule Gratuit.")
                ->line('Les offres au-delà de la limite Gratuit ont été repassées en brouillon : vous choisissez celles à republier.')
                ->action('Renouveler', $billingUrl),
        };
    }
}
