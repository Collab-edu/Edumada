<?php

namespace App\Http\Resources;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AuditLog
 */
class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'user' => $this->user ? ['id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email] : null,
            'subjectType' => $this->subject_type ? class_basename($this->subject_type) : null,
            'subjectId' => $this->subject_id,
            'meta' => (object) ($this->meta ?? []),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
