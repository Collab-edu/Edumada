<?php

namespace App\Http\Resources;

use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Format `FormationDetailType` du site : contenu détaillé de la fiche offre.
 *
 * @mixin Offer
 */
class OfferDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'description' => $this->description ?? '',
            'objectives' => $this->objectives ?? [],
            'skills' => $this->skills ?? [],
            'subjects' => $this->subjects ?? [],
            'program' => $this->program ?? [],
            'specializations' => $this->specializations ?? [],
            'teachingMethods' => $this->teaching_methods ?? [],
            'evaluation' => $this->evaluation ?? '',
            'admission' => [
                'prerequisites' => $this->prerequisites ?? [],
                'specialConditions' => $this->special_conditions,
                'minAge' => $this->min_age,
            ],
            'costs' => [
                'applicationFee' => $this->application_fee,
                'otherFees' => $this->other_fees ?? [],
                'status' => $this->costs_status->label(),
                'paymentOptions' => $this->payment_options ?? [],
                'scholarships' => $this->scholarships_info,
                'discounts' => $this->discounts,
            ],
            'organization' => [
                'schedule' => $this->schedule,
                'campus' => $this->campus ?? '',
                'rhythm' => $this->rhythm ?? [],
            ],
            'careers' => [
                'jobs' => $this->jobs ?? [],
                'sectors' => $this->sectors ?? [],
                'furtherStudies' => $this->further_studies ?? [],
                'internship' => $this->internship,
                'partnerships' => $this->partnerships ?? [],
            ],
            'onlineApplication' => $this->online_application,
            'brochureUrl' => $this->brochure_url,
            'academicCalendar' => $this->academic_calendar ?? [],
            'lastVerified' => ($this->last_verified_at ?? $this->updated_at)?->toDateString(),
        ];
    }
}
