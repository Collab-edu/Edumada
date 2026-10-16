<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AdmissionLevel;
use App\Enums\AdmissionSelection;
use App\Enums\CampaignStatus;
use App\Enums\CostsStatus;
use App\Enums\Diploma;
use App\Enums\EstablishmentSector;
use App\Enums\EstablishmentStatus;
use App\Enums\FeesPeriod;
use App\Enums\HousingAvailability;
use App\Enums\InquiryStatus;
use App\Enums\Modality;
use App\Enums\OfferKind;
use App\Enums\OfferStatus;
use App\Enums\PaymentMethod;
use App\Enums\RegistrationStatus;
use App\Enums\ReportReason;
use App\Enums\ScholarshipAvailability;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\OfferSearchRequest;
use Illuminate\Http\JsonResponse;

/**
 * Valeurs acceptées par l'API, pour construire les listes déroulantes du site et du back-office
 * sans les recopier en dur.
 */
class ReferenceDataController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $statuses = fn (string $enum) => array_map(
            fn ($case) => ['value' => $case->value, 'label' => $case->label()],
            $enum::cases(),
        );

        return response()->json([
            'data' => [
                'establishmentTypes' => EstablishmentSector::labels(),
                'offerKinds' => OfferKind::labels(),
                'diplomas' => Diploma::labels(),
                'modalities' => Modality::labels(),
                'registrationStatuses' => RegistrationStatus::labels(),
                'admissionLevels' => AdmissionLevel::labels(),
                'admissionSelections' => AdmissionSelection::labels(),
                'feesPeriods' => FeesPeriod::labels(),
                'housing' => HousingAvailability::labels(),
                'scholarships' => ScholarshipAvailability::labels(),
                'costsStatuses' => CostsStatus::labels(),
                'verificationStatuses' => VerificationStatus::labels(),
                'studentLevels' => OfferSearchRequest::STUDENT_LEVELS,
                'durations' => OfferSearchRequest::DURATIONS,
                'languages' => [...OfferSearchRequest::KNOWN_LANGUAGES, 'Autre'],
                'inquiryStatuses' => $statuses(InquiryStatus::class),
                'reportReasons' => $statuses(ReportReason::class),
                'paymentMethods' => $statuses(PaymentMethod::class),
                'campaignStatuses' => $statuses(CampaignStatus::class),
                'sorts' => OfferSearchRequest::SORTS,
                'offerStatuses' => $statuses(OfferStatus::class),
                'establishmentStatuses' => $statuses(EstablishmentStatus::class),
                'moderationVerificationStatuses' => $statuses(VerificationStatus::class),
            ],
        ]);
    }
}
