<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Téléchargement d'une pièce jointe : réservé à l'étudiant auteur et à l'établissement destinataire.
 */
class InquiryAttachmentController extends Controller
{
    public function show(Inquiry $inquiry, InquiryAttachment $attachment): StreamedResponse
    {
        Gate::authorize('view', $inquiry);

        return Storage::disk('local')->download($attachment->path, $attachment->original_name);
    }
}
