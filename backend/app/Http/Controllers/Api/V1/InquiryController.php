<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Enums\StatMetric;
use App\Http\Controllers\Controller;
use App\Http\Requests\InquiryRequest;
use App\Http\Resources\InquiryResource;
use App\Models\DailyStat;
use App\Models\Inquiry;
use App\Models\Offer;
use App\Notifications\NewInquiryReceived;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;

class InquiryController extends Controller
{
    /**
     * Demandes et candidatures de l'étudiant connecté, avec leur historique.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return InquiryResource::collection(
            $request->user()->inquiries()
                ->with(['offer', 'establishment', 'statusChanges', 'attachments'])
                ->latest()
                ->get(),
        );
    }

    /**
     * Envoie une demande d'information ou une candidature à l'établissement de l'offre.
     */
    public function store(InquiryRequest $request, Offer $offer): InquiryResource
    {
        Gate::authorize('create', [Inquiry::class, $offer]);

        $user = $request->user();
        $establishment = $offer->establishment;

        $inquiry = DB::transaction(function () use ($request, $offer, $user, $establishment): Inquiry {
            $inquiry = Inquiry::create([
                'type' => $request->validated('type'),
                'user_id' => $user->id,
                'establishment_id' => $establishment->id,
                'offer_id' => $offer->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $request->validated('phone') ?? $user->phone,
                'message' => $request->validated('message'),
            ]);
            $inquiry->statusChanges()->create(['user_id' => $user->id, 'to_status' => InquiryStatus::New]);

            foreach ($request->file('attachments', []) as $file) {
                $inquiry->attachments()->create([
                    'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
                    'path' => $file->store("inquiries/{$inquiry->id}", 'local'),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }

            return $inquiry;
        });

        $inquiry->load(['offer', 'establishment', 'statusChanges', 'attachments']);

        $notification = new NewInquiryReceived($inquiry, $establishment->hasFeature('inquiryInbox'));
        if ($establishment->email) {
            Notification::route('mail', $establishment->email)->notify($notification);
        }
        Notification::send($establishment->members, $notification);

        DailyStat::bump($establishment->id, $offer->id, null, $inquiry->type === InquiryType::Application ? StatMetric::ApplyClick : StatMetric::ContactClick);

        return new InquiryResource($inquiry);
    }

    public function show(Inquiry $inquiry): InquiryResource
    {
        Gate::authorize('view', $inquiry);

        return new InquiryResource($inquiry->load(['offer', 'establishment', 'statusChanges', 'attachments']));
    }
}
