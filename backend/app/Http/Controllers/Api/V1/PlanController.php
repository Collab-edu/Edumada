<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlanController extends Controller
{
    /**
     * Formules établissement (Gratuit, Pro, Premium) et leurs limites.
     */
    public function index(): AnonymousResourceCollection
    {
        return PlanResource::collection(Plan::orderBy('position')->get());
    }
}
