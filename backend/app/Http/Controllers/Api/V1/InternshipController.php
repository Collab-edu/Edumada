<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OfferStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipResource;
use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Offres de stage publiées, consultables sans compte.
 */
class InternshipController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = $request->validate(['perPage' => ['nullable', 'integer', 'between:1,100']])['perPage'] ?? 24;

        return InternshipResource::collection(
            Internship::where('status', OfferStatus::Published)->with('domain')->latest()->paginate($perPage),
        );
    }

    public function show(Internship $internship): InternshipResource
    {
        abort_unless($internship->status === OfferStatus::Published, 404);

        return new InternshipResource($internship->load('domain'));
    }
}
