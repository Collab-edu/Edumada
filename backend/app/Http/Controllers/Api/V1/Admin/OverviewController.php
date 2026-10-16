<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ClaimStatus;
use App\Enums\EstablishmentStatus;
use App\Enums\InquiryStatus;
use App\Enums\InvoiceStatus;
use App\Enums\OfferStatus;
use App\Enums\ReportStatus;
use App\Enums\ReviewStatus;
use App\Enums\SubscriptionStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\EstablishmentClaim;
use App\Models\Inquiry;
use App\Models\Invoice;
use App\Models\Offer;
use App\Models\Report;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Indicateurs du pilote : usage étudiant, catalogue, demandes traitées, formules et file de modération.
 */
class OverviewController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $since = now()->subDays(30);
        $inquiries = Inquiry::query();

        return response()->json(['data' => [
            'users' => [
                'students' => User::where('role', UserRole::Student)->count(),
                'establishments' => User::where('role', UserRole::Establishment)->count(),
                'newLast30Days' => User::where('created_at', '>=', $since)->count(),
            ],
            'catalog' => [
                'establishments' => Establishment::count(),
                'published' => Establishment::where('status', EstablishmentStatus::Published)->count(),
                'verified' => Establishment::where('verification_status', 'verified')->count(),
                'offersPublished' => Offer::where('status', OfferStatus::Published)->count(),
                'offersUpdatedLast90Days' => Offer::where('updated_at', '>=', now()->subDays(90))->count(),
            ],
            'inquiries' => [
                'total' => (clone $inquiries)->count(),
                'last30Days' => (clone $inquiries)->where('created_at', '>=', $since)->count(),
                'processed' => (clone $inquiries)->where('status', '!=', InquiryStatus::New)->count(),
                'applications' => (clone $inquiries)->where('type', 'application')->count(),
            ],
            'subscriptions' => Subscription::whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Grace])
                ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
                ->selectRaw('plans.code, count(*) as total')
                ->groupBy('plans.code')
                ->pluck('total', 'code'),
            'revenue' => [
                'thisMonth' => (int) Invoice::where('status', InvoiceStatus::Paid)->where('paid_at', '>=', now()->startOfMonth())->sum('amount'),
                'last12Months' => (int) Invoice::where('status', InvoiceStatus::Paid)->where('paid_at', '>=', now()->subYear())->sum('amount'),
            ],
            'queues' => [
                'establishmentsPending' => Establishment::where('status', EstablishmentStatus::PendingReview)->count(),
                'verificationsPending' => Establishment::where('verification_status', 'pending')->count(),
                'claimsPending' => EstablishmentClaim::where('status', ClaimStatus::Pending)->count(),
                'reportsOpen' => Report::where('status', ReportStatus::Open)->count(),
                'reviewsPending' => Review::where('status', ReviewStatus::Pending)->count(),
                'invoicesPending' => Invoice::where('status', InvoiceStatus::Pending)->count(),
            ],
        ]]);
    }
}
