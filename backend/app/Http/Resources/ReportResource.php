<?php

namespace App\Http\Resources;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Report
 */
class ReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'establishment' => ['id' => $this->establishment->slug, 'name' => $this->establishment->name],
            'offer' => $this->offer ? ['id' => $this->offer->slug, 'title' => $this->offer->title] : null,
            'reason' => $this->reason->value,
            'reasonLabel' => $this->reason->label(),
            'message' => $this->message,
            'email' => $this->when($request->user()?->isAdmin(), $this->email),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
