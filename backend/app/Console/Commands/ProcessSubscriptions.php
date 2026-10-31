<?php

namespace App\Console\Commands;

use App\Enums\OfferStatus;
use App\Enums\SubscriptionStatus;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Models\Subscription;
use App\Notifications\SubscriptionNotice;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

/**
 * Cycle de vie quotidien des abonnements :
 * rappels à J-30, J-7 et J-1, période de grâce à la date de fin, puis expiration.
 * À l'expiration, la fiche reste en ligne : seules les fonctions payantes sont suspendues,
 * et les offres au-delà de la limite Gratuit repassent en brouillon.
 */
#[Signature('subscriptions:process')]
#[Description('Rappels d\'expiration, période de grâce et expiration des abonnements')]
class ProcessSubscriptions extends Command
{
    public function handle(): int
    {
        $reminders = $expiring = $expired = 0;

        Subscription::with(['plan', 'establishment.members'])
            ->where('status', SubscriptionStatus::Active)
            ->whereNotNull('ends_at')
            ->each(function (Subscription $subscription) use (&$reminders, &$expiring): void {
                if ($subscription->ends_at->isPast()) {
                    $subscription->update([
                        'status' => SubscriptionStatus::Grace,
                        'grace_ends_at' => $subscription->ends_at->copy()->addDays(config('edumada.subscription_grace_days')),
                    ]);
                    $expiring++;

                    return;
                }

                $daysLeft = (int) ceil(now()->diffInDays($subscription->ends_at));
                $sent = $subscription->reminders_sent ?? [];
                foreach (config('edumada.subscription_reminder_days') as $day) {
                    if ($daysLeft <= $day && ! in_array($day, $sent, true)) {
                        $this->notify($subscription, new SubscriptionNotice($subscription, SubscriptionNotice::EXPIRING, max($daysLeft, 1)));
                        $subscription->update(['reminders_sent' => [...$sent, ...array_filter(config('edumada.subscription_reminder_days'), fn (int $d) => $d >= $daysLeft)]]);
                        $reminders++;
                        break;
                    }
                }
            });

        Subscription::with(['plan', 'establishment.members'])
            ->where('status', SubscriptionStatus::Grace)
            ->where('grace_ends_at', '<=', now())
            ->each(function (Subscription $subscription) use (&$expired): void {
                $subscription->update(['status' => SubscriptionStatus::Expired]);
                $this->enforceFreeLimit($subscription->establishment);
                AuditLog::record('subscription.expired', $subscription, ['plan' => $subscription->plan->code->value]);
                $this->notify($subscription, new SubscriptionNotice($subscription, SubscriptionNotice::EXPIRED));
                $expired++;
            });

        $this->info("Rappels envoyés : {$reminders} · en période de grâce : {$expiring} · expirés : {$expired}");

        return self::SUCCESS;
    }

    /**
     * Garde publiées les offres les plus récemment mises à jour, dans la limite de la formule en vigueur.
     */
    private function enforceFreeLimit(Establishment $establishment): void
    {
        $limit = $establishment->currentPlan()->max_published_offers;
        if ($limit === null) {
            return;
        }

        $establishment->publishedOffers()
            ->latest('updated_at')
            ->skip($limit)
            ->take(PHP_INT_MAX)
            ->get()
            ->each(fn ($offer) => $offer->update(['status' => OfferStatus::Draft]));
    }

    private function notify(Subscription $subscription, SubscriptionNotice $notice): void
    {
        $establishment = $subscription->establishment;
        Notification::send($establishment->members, $notice);
        if ($establishment->email) {
            Notification::route('mail', $establishment->email)->notify($notice);
        }
    }
}
