<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryResource;
use App\Models\Inquiry;
use App\Models\InquiryMessage;
use App\Notifications\InquiryMessageReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * Échange de messages d'une demande d'information, entre l'étudiant et l'établissement.
 */
class InquiryMessageController extends Controller
{
    public function store(Request $request, Inquiry $inquiry): InquiryResource
    {
        Gate::authorize('reply', $inquiry);

        $validated = $request->validate(['message' => ['required', 'string', 'max:3000']]);

        if ($inquiry->type !== InquiryType::Information) {
            throw ValidationException::withMessages(['message' => 'Les candidatures se suivent avec leur statut.']);
        }

        $fromStudent = $inquiry->user_id === $request->user()->id;

        DB::transaction(function () use ($inquiry, $validated, $request, $fromStudent): void {
            $inquiry->messages()->create([
                'user_id' => $request->user()->id,
                'sender' => $fromStudent ? InquiryMessage::SENDER_STUDENT : InquiryMessage::SENDER_ESTABLISHMENT,
                'body' => $validated['message'],
            ]);
            // « new » : l'établissement doit répondre ; ce n'est pas un statut affiché.
            $inquiry->status = $fromStudent ? InquiryStatus::New : InquiryStatus::InReview;
            $inquiry->save();
        });

        $inquiry->load(['offer', 'establishment.members', 'statusChanges', 'attachments', 'messages', 'user']);
        $this->notify($inquiry, $validated['message'], $fromStudent);

        return new InquiryResource($inquiry);
    }

    private function notify(Inquiry $inquiry, string $body, bool $fromStudent): void
    {
        $establishment = $inquiry->establishment;
        $notification = new InquiryMessageReceived($inquiry, $body, $fromStudent, $establishment->hasFeature('inquiryInbox'));

        if (! $fromStudent) {
            $inquiry->user
                ? $inquiry->user->notify($notification)
                : Notification::route('mail', $inquiry->email)->notify($notification);

            return;
        }

        if ($establishment->email) {
            Notification::route('mail', $establishment->email)->notify($notification);
        }
        Notification::send($establishment->members, $notification);
    }
}
