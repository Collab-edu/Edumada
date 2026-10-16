<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ReportReason;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Establishment;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Signalement d'une information erronée, par n'importe quel visiteur.
 */
class ReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'establishment' => ['required', 'string', Rule::exists('establishments', 'slug')->whereNull('deleted_at')],
            'offer' => ['nullable', 'string', Rule::exists('offers', 'slug')],
            'reason' => ['required', Rule::enum(ReportReason::class)],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $establishment = Establishment::where('slug', $validated['establishment'])->firstOrFail();
        $user = $request->user('sanctum');

        Report::create([
            'establishment_id' => $establishment->id,
            'offer_id' => isset($validated['offer']) ? $establishment->offers()->where('slug', $validated['offer'])->value('id') : null,
            'user_id' => $user?->id,
            'reason' => $validated['reason'],
            'message' => $validated['message'],
            'email' => $validated['email'] ?? $user?->email,
        ]);

        return response()->json(['message' => 'Merci ! Edumada va vérifier cette information.'], 201);
    }

    /**
     * Signalements reçus par un établissement, pour corriger sa fiche.
     */
    public function index(Establishment $establishment): AnonymousResourceCollection
    {
        Gate::authorize('update', $establishment);

        return ReportResource::collection($establishment->reports()->with(['establishment', 'offer'])->latest()->limit(100)->get());
    }
}
