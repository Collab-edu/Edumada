<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipApplicationResource;
use App\Models\Internship;
use App\Models\InternshipApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Candidatures d'un étudiant connecté aux offres de stage.
 */
class InternshipApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return InternshipApplicationResource::collection(
            InternshipApplication::where('user_id', $request->user()->id)->with('internship')->latest()->get(),
        );
    }

    public function store(Request $request, Internship $internship): InternshipApplicationResource
    {
        $user = $request->user();
        abort_unless($user->isStudent(), 403, 'Les candidatures sont envoyées depuis un compte étudiant.');
        abort_unless($internship->status->value === 'published', 404);

        $validated = $request->validate([
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'letter' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'phone' => ['required', 'string', 'max:30'],
        ], [], ['cv' => 'CV', 'letter' => 'lettre de motivation', 'phone' => 'téléphone']);

        if (! $internship->acceptsApplications()) {
            throw ValidationException::withMessages(['internship' => 'Les candidatures à ce stage sont fermées.']);
        }
        if ($internship->applications()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages(['internship' => 'Vous avez déjà postulé à ce stage.']);
        }

        $application = DB::transaction(function () use ($request, $internship, $user, $validated): InternshipApplication {
            $application = new InternshipApplication;
            $application->internship_id = $internship->id;
            $application->user_id = $user->id;
            $application->phone = $validated['phone'];
            $application->cv_path = '';
            $application->cv_name = mb_substr($request->file('cv')->getClientOriginalName(), 0, 255);
            $application->letter_path = '';
            $application->letter_name = mb_substr($request->file('letter')->getClientOriginalName(), 0, 255);
            $application->save();

            $application->cv_path = $request->file('cv')->store($application->directory(), 'local');
            $application->letter_path = $request->file('letter')->store($application->directory(), 'local');
            $application->save();

            return $application;
        });

        return new InternshipApplicationResource($application->load('internship'));
    }
}
