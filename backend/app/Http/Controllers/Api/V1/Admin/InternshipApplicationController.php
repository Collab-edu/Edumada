<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipApplicationResource;
use App\Models\InternshipApplication;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Candidatures aux stages reçues dans le back-office.
 */
class InternshipApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'internship' => ['nullable', 'string', 'max:255'],
        ]);

        return InternshipApplicationResource::collection(
            InternshipApplication::with(['internship', 'user'])
                ->when($filters['internship'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('internship', fn (Builder $internships) => $internships->where('slug', $slug)))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        );
    }

    public function cv(InternshipApplication $application): StreamedResponse
    {
        return Storage::disk('local')->download($application->cv_path, $application->cv_name);
    }

    public function letter(InternshipApplication $application): StreamedResponse
    {
        return Storage::disk('local')->download($application->letter_path, $application->letter_name);
    }
}
