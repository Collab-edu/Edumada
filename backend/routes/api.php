<?php

use App\Http\Controllers\Api\V1\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\V1\Admin\BillingController as AdminBillingController;
use App\Http\Controllers\Api\V1\Admin\EstablishmentController as AdminEstablishmentController;
use App\Http\Controllers\Api\V1\Admin\ModerationController;
use App\Http\Controllers\Api\V1\Admin\OverviewController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Auth\ProfileController;
use App\Http\Controllers\Api\V1\Auth\RegisteredUserController;
use App\Http\Controllers\Api\V1\Auth\TokenController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\DomainController;
use App\Http\Controllers\Api\V1\EstablishmentClaimController;
use App\Http\Controllers\Api\V1\EstablishmentController;
use App\Http\Controllers\Api\V1\EstablishmentInquiryController;
use App\Http\Controllers\Api\V1\EstablishmentModerationController;
use App\Http\Controllers\Api\V1\EstablishmentStatsController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\InquiryAttachmentController;
use App\Http\Controllers\Api\V1\InquiryController;
use App\Http\Controllers\Api\V1\InquiryStatusController;
use App\Http\Controllers\Api\V1\ManagedEstablishmentController;
use App\Http\Controllers\Api\V1\OfferController;
use App\Http\Controllers\Api\V1\PlaceController;
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\ReferenceDataController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\TrackController;
use App\Http\Controllers\Api\V1\UploadController;
use App\Http\Controllers\Api\V1\VerificationRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Catalogue public : consultable sans compte.
    Route::get('reference', ReferenceDataController::class)->name('reference');
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::apiResource('domains', DomainController::class)->only(['index']);
    Route::apiResource('establishments', EstablishmentController::class)->only(['index', 'show']);
    Route::apiResource('offers', OfferController::class)->only(['index', 'show']);
    Route::get('establishments/{establishment}/offers/{urlSlug}', [OfferController::class, 'showByUrl'])->name('establishments.offers.show');
    Route::get('places', [PlaceController::class, 'index'])->middleware('throttle:places')->name('places.index');
    Route::get('places/here', [PlaceController::class, 'here'])->middleware('throttle:places')->name('places.here');
    Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::get('plans', [PlanController::class, 'index'])->name('plans.index');
    Route::get('sponsored', [CampaignController::class, 'sponsored'])->name('sponsored');
    Route::post('track', [TrackController::class, 'store'])->middleware('throttle:track')->name('track');
    Route::post('reports', [ReportController::class, 'store'])->middleware('throttle:reports')->name('reports.store');
    Route::get('articles', [ArticleController::class, 'index'])->name('articles.index');
    Route::get('articles/{slug}', [ArticleController::class, 'show'])->name('articles.show');
    Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:contact')->name('contact.store');

    // Authentification.
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('register', [RegisteredUserController::class, 'store'])->middleware('throttle:register')->name('register');
        Route::post('login', [TokenController::class, 'store'])->middleware('throttle:login')->name('login');
        Route::post('google', [TokenController::class, 'google'])->middleware('throttle:google')->name('google');
        Route::post('forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:password-reset')->name('password.forgot');
        Route::post('reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:password-reset')->name('password.reset');
    });

    Route::middleware('auth:sanctum')->group(function () {
        // Compte connecté.
        Route::post('auth/logout', [TokenController::class, 'destroy'])->name('auth.logout');
        Route::get('me', [CurrentUserController::class, 'show'])->name('me');
        Route::patch('me', [ProfileController::class, 'update'])->name('me.update');
        Route::put('me/password', [ProfileController::class, 'updatePassword'])->name('me.password');
        Route::delete('me', [ProfileController::class, 'destroy'])->name('me.destroy');
        Route::get('me/establishments', [ManagedEstablishmentController::class, 'index'])->name('me.establishments');
        Route::get('establishments/{establishment}/manage', [ManagedEstablishmentController::class, 'show'])->name('establishments.manage');

        // Espace étudiant : favoris, demandes et candidatures, avis.
        Route::get('me/favorites', [FavoriteController::class, 'index'])->name('me.favorites.index');
        Route::put('me/favorites/{offer}', [FavoriteController::class, 'update'])->name('me.favorites.update');
        Route::delete('me/favorites/{offer}', [FavoriteController::class, 'destroy'])->name('me.favorites.destroy');
        Route::get('me/inquiries', [InquiryController::class, 'index'])->name('me.inquiries');
        Route::post('offers/{offer}/inquiries', [InquiryController::class, 'store'])->middleware('throttle:20,60')->name('offers.inquiries.store');
        Route::get('inquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
        Route::get('inquiries/{inquiry}/attachments/{attachment}', [InquiryAttachmentController::class, 'show'])->scopeBindings()->name('inquiries.attachments.show');
        Route::post('establishments/{establishment}/reviews', [ReviewController::class, 'store'])->middleware('throttle:10,60')->name('establishments.reviews.store');

        // Référentiels (administrateurs).
        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('domains', DomainController::class)->only(['store', 'update', 'destroy']);

        // Tableau de bord établissement : fiche, offres, demandes, statistiques, formule, campagnes.
        Route::post('uploads', [UploadController::class, 'store'])->middleware('throttle:60,60')->name('uploads.store');
        Route::post('uploads/documents', [UploadController::class, 'storeDocument'])->middleware('throttle:30,60')->name('uploads.documents.store');
        Route::apiResource('establishments', EstablishmentController::class)->only(['store', 'update', 'destroy']);
        Route::put('establishments/{establishment}/moderation', [EstablishmentModerationController::class, 'update'])->name('establishments.moderation');
        Route::post('establishments/{establishment}/verification-request', [VerificationRequestController::class, 'store'])->name('establishments.verification-request');
        Route::post('establishments/{establishment}/claims', [EstablishmentClaimController::class, 'store'])->name('establishments.claims.store');
        Route::get('establishments/{establishment}/members', [TeamController::class, 'index'])->name('establishments.team.index');
        Route::post('establishments/{establishment}/members', [TeamController::class, 'store'])->middleware('throttle:20,60')->name('establishments.team.store');
        Route::put('establishments/{establishment}/members/{user}', [TeamController::class, 'update'])->name('establishments.team.update');
        Route::delete('establishments/{establishment}/members/{user}', [TeamController::class, 'destroy'])->name('establishments.team.destroy');
        Route::post('establishments/{establishment}/offers', [OfferController::class, 'store'])->name('establishments.offers.store');
        Route::apiResource('offers', OfferController::class)->only(['update', 'destroy']);
        Route::get('establishments/{establishment}/inquiries', [EstablishmentInquiryController::class, 'index'])->name('establishments.inquiries.index');
        Route::get('establishments/{establishment}/inquiries/export', [EstablishmentInquiryController::class, 'export'])->name('establishments.inquiries.export');
        Route::put('inquiries/{inquiry}/status', [InquiryStatusController::class, 'update'])->name('inquiries.status');
        Route::get('establishments/{establishment}/reports', [ReportController::class, 'index'])->name('establishments.reports.index');
        Route::get('establishments/{establishment}/stats', [EstablishmentStatsController::class, 'show'])->name('establishments.stats');
        Route::get('establishments/{establishment}/billing', [BillingController::class, 'show'])->name('establishments.billing');
        Route::post('establishments/{establishment}/subscription-requests', [BillingController::class, 'store'])->name('establishments.subscription-requests.store');
        Route::get('invoices/{invoice}', [BillingController::class, 'showInvoice'])->name('invoices.show');
        Route::patch('invoices/{invoice}', [BillingController::class, 'updateInvoice'])->name('invoices.update');
        Route::get('establishments/{establishment}/campaigns', [CampaignController::class, 'index'])->name('establishments.campaigns.index');
        Route::post('establishments/{establishment}/campaigns', [CampaignController::class, 'store'])->name('establishments.campaigns.store');
        Route::patch('campaigns/{campaign}', [CampaignController::class, 'update'])->name('campaigns.update');
        Route::delete('campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');

        // Administration.
        Route::prefix('admin')->name('admin.')->middleware('can:admin')->group(function () {
            Route::get('overview', OverviewController::class)->name('overview');
            Route::get('establishments', [AdminEstablishmentController::class, 'index'])->name('establishments.index');
            Route::get('establishments/counts', [AdminEstablishmentController::class, 'counts'])->name('establishments.counts');
            Route::post('establishments/{establishment}/members', [AdminEstablishmentController::class, 'storeMember'])->name('establishments.members.store');
            Route::delete('establishments/{establishment}/members/{user}', [AdminEstablishmentController::class, 'destroyMember'])->name('establishments.members.destroy');
            Route::get('users', [UserController::class, 'index'])->name('users.index');
            Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
            Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
            Route::get('reviews', [ModerationController::class, 'reviews'])->name('reviews.index');
            Route::put('reviews/{review}', [ModerationController::class, 'updateReview'])->name('reviews.update');
            Route::get('reports', [ModerationController::class, 'reports'])->name('reports.index');
            Route::put('reports/{report}', [ModerationController::class, 'updateReport'])->name('reports.update');
            Route::get('claims', [ModerationController::class, 'claims'])->name('claims.index');
            Route::put('claims/{claim}', [ModerationController::class, 'updateClaim'])->name('claims.update');
            Route::get('audit-logs', [ModerationController::class, 'auditLogs'])->name('audit-logs.index');
            Route::get('invoices', [AdminBillingController::class, 'invoices'])->name('invoices.index');
            Route::put('invoices/{invoice}/confirm', [AdminBillingController::class, 'confirmInvoice'])->name('invoices.confirm');
            Route::post('establishments/{establishment}/activate-plan', [AdminBillingController::class, 'activatePlan'])->name('establishments.activate-plan');
            Route::put('invoices/{invoice}/cancel', [AdminBillingController::class, 'cancelInvoice'])->name('invoices.cancel');
            Route::get('subscriptions', [AdminBillingController::class, 'subscriptions'])->name('subscriptions.index');
            Route::put('subscriptions/{subscription}/cancel', [AdminBillingController::class, 'cancelSubscription'])->name('subscriptions.cancel');
            Route::patch('plans/{plan:code}', [AdminBillingController::class, 'updatePlan'])->name('plans.update');
            Route::get('campaigns', [AdminBillingController::class, 'campaigns'])->name('campaigns.index');
            Route::apiResource('articles', AdminArticleController::class)->only(['index', 'store', 'update', 'destroy']);
        });
    });
});
