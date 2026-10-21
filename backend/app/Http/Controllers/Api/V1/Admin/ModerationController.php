<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ClaimStatus;
use App\Enums\EstablishmentMemberRole;
use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminReviewResource;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\ClaimResource;
use App\Http\Resources\ReportResource;
use App\Models\AuditLog;
use App\Models\EstablishmentClaim;
use App\Models\Report;
use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Files de modération : avis, signalements, revendications de fiche, et journal d'audit.
 */
class ModerationController extends Controller
{
    public function reviews(Request $request): AnonymousResourceCollection
    {
        $status = $request->validate(['status' => ['nullable', Rule::enum(ReviewStatus::class)]])['status'] ?? null;

        return AdminReviewResource::collection(
            Review::with(['establishment', 'offer'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        );
    }

    public function updateReview(Request $request, Review $review): AdminReviewResource
    {
        $validated = $request->validate(['status' => ['required', Rule::enum(ReviewStatus::class)]]);

        $review->status = ReviewStatus::from($validated['status']);
        $review->save();
        AuditLog::record('review.moderated', $review, ['status' => $review->status->value]);

        return new AdminReviewResource($review->load(['establishment', 'offer']));
    }

    public function reports(Request $request): AnonymousResourceCollection
    {
        $status = $request->validate(['status' => ['nullable', Rule::enum(ReportStatus::class)]])['status'] ?? null;

        return ReportResource::collection(
            Report::with(['establishment', 'offer'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        );
    }

    public function updateReport(Request $request, Report $report): ReportResource
    {
        $validated = $request->validate(['status' => ['required', Rule::enum(ReportStatus::class)]]);

        $report->status = ReportStatus::from($validated['status']);
        $report->save();

        return new ReportResource($report->load(['establishment', 'offer']));
    }

    public function claims(Request $request): AnonymousResourceCollection
    {
        $status = $request->validate(['status' => ['nullable', Rule::enum(ClaimStatus::class)]])['status'] ?? null;

        return ClaimResource::collection(
            EstablishmentClaim::with(['establishment', 'user'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        );
    }

    /**
     * Accepter une revendication donne la gestion de la fiche au demandeur, comme propriétaire.
     */
    public function updateClaim(Request $request, EstablishmentClaim $claim): ClaimResource
    {
        $validated = $request->validate(['status' => ['required', Rule::in([ClaimStatus::Approved->value, ClaimStatus::Rejected->value])]]);

        DB::transaction(function () use ($claim, $validated): void {
            $claim->status = ClaimStatus::from($validated['status']);
            $claim->save();

            if ($claim->status === ClaimStatus::Approved) {
                $claim->establishment->addMember($claim->user, EstablishmentMemberRole::Owner, 'status');
            }
            AuditLog::record('establishment.claim_'.$claim->status->value, $claim->establishment, ['user' => $claim->user->email]);
        });

        return new ClaimResource($claim->load(['establishment', 'user']));
    }

    public function auditLogs(Request $request): AnonymousResourceCollection
    {
        $action = $request->validate(['action' => ['nullable', 'string', 'max:60']])['action'] ?? null;

        return AuditLogResource::collection(
            AuditLog::with('user')
                ->when($action, fn (Builder $query) => $query->where('action', 'like', "{$action}%"))
                ->latest('id')
                ->paginate(50)
                ->withQueryString(),
        );
    }
}
