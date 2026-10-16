<?php

use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\RegisteredUserController;
use App\Http\Controllers\Api\V1\Auth\TokenController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DomainController;
use App\Http\Controllers\Api\V1\EstablishmentController;
use App\Http\Controllers\Api\V1\EstablishmentModerationController;
use App\Http\Controllers\Api\V1\ManagedEstablishmentController;
use App\Http\Controllers\Api\V1\OfferController;
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\ReferenceDataController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Catalogue public : consultable sans compte.
    Route::get('reference', ReferenceDataController::class)->name('reference');
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::apiResource('domains', DomainController::class)->only(['index']);
    Route::apiResource('establishments', EstablishmentController::class)->only(['index', 'show']);
    Route::apiResource('offers', OfferController::class)->only(['index', 'show']);
    Route::get('plans', [PlanController::class, 'index'])->name('plans.index');

    // Authentification.
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('register', [RegisteredUserController::class, 'store'])->middleware('throttle:register')->name('register');
        Route::post('login', [TokenController::class, 'store'])->middleware('throttle:login')->name('login');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [TokenController::class, 'destroy'])->name('auth.logout');
        Route::get('me', [CurrentUserController::class, 'show'])->name('me');
        Route::get('me/establishments', [ManagedEstablishmentController::class, 'index'])->name('me.establishments');

        // Back-office : référentiels (administrateurs).
        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('domains', DomainController::class)->only(['store', 'update', 'destroy']);

        // Back-office : fiches et offres (équipe de l'établissement ou administrateurs).
        Route::apiResource('establishments', EstablishmentController::class)->only(['store', 'update', 'destroy']);
        Route::put('establishments/{establishment}/moderation', [EstablishmentModerationController::class, 'update'])->name('establishments.moderation');
        Route::post('establishments/{establishment}/offers', [OfferController::class, 'store'])->name('establishments.offers.store');
        Route::apiResource('offers', OfferController::class)->only(['update', 'destroy']);
    });
});
