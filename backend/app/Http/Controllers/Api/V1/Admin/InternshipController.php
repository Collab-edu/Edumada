<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\Modality;
use App\Enums\OfferStatus;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipResource;
use App\Models\AuditLog;
use App\Models\Domain;
use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

/**
 * Gestion des offres de stage, réservée à l'administration Edumada.
 */
class InternshipController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return InternshipResource::collection(Internship::with('domain')->latest()->paginate(50));
    }

    public function store(Request $request): InternshipResource
    {
        $internship = new Internship($this->attributes($request, required: true));
        $internship->slug = Internship::uniqueSlug($internship->title.' '.$internship->company_name);
        $internship->status ??= OfferStatus::Draft;
        $internship->save();
        AuditLog::record('internship.created', $internship, ['title' => $internship->title]);

        return new InternshipResource($internship->load('domain'));
    }

    public function update(Request $request, Internship $internship): InternshipResource
    {
        $internship->update($this->attributes($request, required: false));

        return new InternshipResource($internship->load('domain'));
    }

    public function destroy(Internship $internship): Response
    {
        $internship->delete();
        AuditLog::record('internship.deleted', $internship, ['title' => $internship->title]);

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function attributes(Request $request, bool $required): array
    {
        $rule = $required ? 'required' : 'sometimes';
        $validated = $request->validate([
            'companyName' => [$rule, 'string', 'max:255'],
            'companyLogo' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'title' => [$rule, 'string', 'max:255'],
            'domain' => ['sometimes', 'nullable', 'string', Rule::exists('domains', 'name')],
            'city' => [$rule, 'string', 'max:100'],
            'durationMonths' => ['sometimes', 'nullable', 'integer', 'between:1,60'],
            'modality' => [$rule, Rule::in(Modality::labels())],
            'registration' => [$rule, Rule::in(RegistrationStatus::labels())],
            'startDate' => ['sometimes', 'nullable', 'date'],
            'contact' => [$rule, 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status' => ['sometimes', Rule::enum(OfferStatus::class)],
        ]);

        $map = [
            'companyName' => 'company_name', 'companyLogo' => 'company_logo', 'title' => 'title', 'city' => 'city',
            'durationMonths' => 'duration_months', 'modality' => 'modality', 'registration' => 'registration',
            'startDate' => 'starts_on', 'contact' => 'contact', 'description' => 'description', 'status' => 'status',
        ];
        $attributes = [];
        foreach ($map as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }
        if (array_key_exists('domain', $validated)) {
            $attributes['domain_id'] = $validated['domain'] ? Domain::where('name', $validated['domain'])->value('id') : null;
        }

        return $attributes;
    }
}
