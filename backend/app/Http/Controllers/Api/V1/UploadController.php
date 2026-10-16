<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Envoi d'une image (logo, couverture, photos, visuel de campagne) par un établissement ou un administrateur.
 * Renvoie l'URL publique à enregistrer dans la fiche.
 */
class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $user->isEstablishmentAccount(), 403);

        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096', 'dimensions:max_width=4000,max_height=4000'],
        ]);

        $path = $request->file('image')->store('uploads/'.now()->format('Y/m'), 'public');

        return response()->json(['url' => Storage::disk('public')->url($path)], 201);
    }
}
