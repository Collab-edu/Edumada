<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryResource;
use App\Models\AuditLog;
use App\Models\Establishment;
use App\Models\Inquiry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Boîte de réception centralisée d'un établissement (Pro et Premium).
 */
class EstablishmentInquiryController extends Controller
{
    public function index(Request $request, Establishment $establishment): AnonymousResourceCollection
    {
        Gate::authorize('viewInbox', [Inquiry::class, $establishment]);

        $inquiries = $this->filteredQuery($request, $establishment)
            ->with(['offer', 'establishment'])
            ->latest()
            ->paginate($request->integer('perPage', 20) ?: 20)
            ->withQueryString();

        return InquiryResource::collection($inquiries)->additional([
            'counts' => $establishment->inquiries()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
        ]);
    }

    /**
     * Export CSV des demandes filtrées. Journalisé : il contient des données personnelles.
     */
    public function export(Request $request, Establishment $establishment): StreamedResponse
    {
        Gate::authorize('viewInbox', [Inquiry::class, $establishment]);

        $inquiries = $this->filteredQuery($request, $establishment)->with('offer')->latest()->get();
        AuditLog::record('inquiries.exported', $establishment, ['count' => $inquiries->count()]);

        return response()->streamDownload(function () use ($inquiries): void {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Date', 'Type', 'Statut', 'Nom', 'E-mail', 'Téléphone', 'Offre', 'Message'], ';');
            foreach ($inquiries as $inquiry) {
                fputcsv($output, [
                    $inquiry->created_at->format('Y-m-d H:i'),
                    $inquiry->type->label(),
                    $inquiry->status->label(),
                    $inquiry->name,
                    $inquiry->email,
                    $inquiry->phone,
                    $inquiry->offer?->title,
                    $inquiry->message,
                ], ';');
            }
            fclose($output);
        }, "demandes-{$establishment->slug}-".now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * @return Builder<Inquiry>
     */
    private function filteredQuery(Request $request, Establishment $establishment): Builder
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(InquiryStatus::class)],
            'type' => ['nullable', Rule::enum(InquiryType::class)],
            'offer' => ['nullable', 'string', 'max:255'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return $establishment->inquiries()->getQuery()
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['offer'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('offer', fn (Builder $offer) => $offer->where('slug', $slug)))
            ->when($filters['q'] ?? null, fn (Builder $query, string $text) => $query->where(
                fn (Builder $query) => $query->whereContains('name', $text)->orWhereContains('email', $text),
            ));
    }
}
