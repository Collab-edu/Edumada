<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Message d'une demande d'information, envoyé par l'étudiant ou par l'établissement.
 */
#[Fillable(['user_id', 'sender', 'body'])]
class InquiryMessage extends Model
{
    public const SENDER_STUDENT = 'student';

    public const SENDER_ESTABLISHMENT = 'establishment';

    /**
     * @return BelongsTo<Inquiry, $this>
     */
    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }
}
