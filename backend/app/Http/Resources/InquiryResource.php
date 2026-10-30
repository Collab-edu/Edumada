<?php

namespace App\Http\Resources;

use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\InquiryStatusChange;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Demande ou candidature. Nécessite `offer` et `establishment` chargés ;
 * l'historique et les pièces jointes sont ajoutés quand ils sont chargés.
 *
 * @mixin Inquiry
 */
class InquiryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'typeLabel' => $this->type->label(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'offer' => $this->offer ? ['id' => $this->offer->slug, 'urlSlug' => $this->offer->url_slug, 'title' => $this->offer->title] : null,
            'establishment' => ['id' => $this->establishment->slug, 'name' => $this->establishment->name],
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
            'history' => $this->whenLoaded('statusChanges', fn () => $this->statusChanges->map(fn (InquiryStatusChange $change) => [
                'from' => $change->from_status?->value,
                'to' => $change->to_status->value,
                'toLabel' => $change->to_status->label(),
                'note' => $change->note,
                'at' => $change->created_at->toIso8601String(),
            ])),
            'attachments' => $this->whenLoaded('attachments', fn () => $this->attachments->map(fn (InquiryAttachment $attachment) => [
                'id' => $attachment->id,
                'name' => $attachment->original_name,
                'mimeType' => $attachment->mime_type,
                'size' => $attachment->size,
            ])),
        ];
    }
}
