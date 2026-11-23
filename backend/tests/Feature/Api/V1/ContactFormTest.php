<?php

namespace Tests\Feature\Api\V1;

use App\Models\ContactMessage;
use App\Notifications\ContactMessageReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_message_is_saved_and_emailed_to_the_team(): void
    {
        Notification::fake();
        config(['edumada.contact_email' => 'contact@edumada.mg']);

        $this->postJson('/api/v1/contact', [
            'name' => 'Rova Rakoto',
            'email' => 'rova@example.com',
            'phone' => '034 00 000 00',
            'subject' => 'partnership',
            'message' => 'Bonjour, je souhaite discuter d’un partenariat.',
        ])->assertCreated();

        $contact = ContactMessage::sole();
        $this->assertSame('rova@example.com', $contact->email);

        Notification::assertSentTo(
            new AnonymousNotifiable,
            ContactMessageReceived::class,
            function (ContactMessageReceived $notification, array $channels, AnonymousNotifiable $notifiable) use ($contact): bool {
                $mail = $notification->toMail($notifiable);

                return $notifiable->routes['mail'] === 'contact@edumada.mg'
                    && $notification->contact->is($contact)
                    && $mail->subject === 'Message du site — Partenariat'
                    && $mail->replyTo === [['rova@example.com', 'Rova Rakoto']];
            }
        );
    }

    public function test_message_is_kept_when_the_email_cannot_be_sent(): void
    {
        Notification::shouldReceive('route')->andThrow(new \RuntimeException('SMTP indisponible'));

        $this->postJson('/api/v1/contact', [
            'name' => 'Rova Rakoto',
            'email' => 'rova@example.com',
            'subject' => 'other',
            'message' => 'Un message assez long pour être valide.',
        ])->assertCreated();

        $this->assertDatabaseCount('contact_messages', 1);
    }
}
