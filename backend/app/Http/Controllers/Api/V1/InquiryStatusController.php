<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryResource;
use App\Models\Inquiry;
use App\Notifications\InquiryStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

/**
 * Traitement d'une demande par l'établissement : nouveau statut, note éventuelle pour l'étudiant.
 */
class InquiryStatusController extends Controller
{
    public function update(Request $request, Inquiry $inquiry): InquiryResource
    {
        Gate::authorize('updateStatus', $inquiry);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(InquiryStatus::class)->except([InquiryStatus::New])],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $previous = $inquiry->status;

        DB::transaction(function () use ($inquiry, $validated, $previous, $request): void {
            $inquiry->status = InquiryStatus::from($validated['status']);
            $inquiry->save();

            $inquiry->statusChanges()->create([
                'user_id' => $request->user()->id,
                'from_status' => $previous,
                'to_status' => $inquiry->status,
                'note' => $validated['note'] ?? null,
            ]);
        });

        $inquiry->load(['offer', 'establishment', 'statusChanges', 'attachments', 'user']);

        $notification = new InquiryStatusChanged($inquiry, $validated['note'] ?? null);
        $inquiry->user
            ? $inquiry->user->notify($notification)
            : Notification::route('mail', $inquiry->email)->notify($notification);

        return new InquiryResource($inquiry);
    }
}
