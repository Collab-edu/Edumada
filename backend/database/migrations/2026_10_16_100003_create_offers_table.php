<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Offres éducatives : formations, niveaux scolaires ou accueil.
     * Les colonnes filtrées par la recherche sont typées ; le contenu détaillé de la fiche est en JSON.
     */
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('domain_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 20);
            $table->string('title');
            $table->string('diploma', 20)->nullable();
            $table->decimal('duration_years', 4, 2)->nullable();
            $table->decimal('age_min', 4, 2)->nullable();
            $table->decimal('age_max', 4, 2)->nullable();
            $table->unsignedInteger('fees')->nullable();
            $table->string('fees_period', 10)->default('an');
            $table->unsignedInteger('registration_fee')->nullable();
            $table->date('registration_starts_on')->nullable();
            $table->date('registration_ends_on')->nullable();
            $table->date('starts_on')->nullable();
            $table->string('modality', 20);
            $table->string('registration_status', 20);
            $table->json('languages')->nullable();
            $table->string('admission_level', 20)->default('none');
            $table->json('bac_series')->nullable();
            $table->string('selection', 30);
            $table->string('housing', 20)->default('unknown');
            $table->string('scholarship', 20)->default('unknown');
            $table->string('image')->nullable();
            $table->string('status', 20)->default('draft');

            // Contenu détaillé de la fiche offre.
            $table->text('description')->nullable();
            $table->json('objectives')->nullable();
            $table->json('skills')->nullable();
            $table->json('subjects')->nullable();
            $table->json('program')->nullable();
            $table->json('specializations')->nullable();
            $table->json('teaching_methods')->nullable();
            $table->text('evaluation')->nullable();
            $table->json('prerequisites')->nullable();
            $table->text('special_conditions')->nullable();
            $table->decimal('min_age', 4, 2)->nullable();
            $table->unsignedInteger('application_fee')->nullable();
            $table->json('other_fees')->nullable();
            $table->string('costs_status', 20)->default('undisclosed');
            $table->json('payment_options')->nullable();
            $table->text('scholarships_info')->nullable();
            $table->text('discounts')->nullable();
            $table->string('schedule')->nullable();
            $table->string('campus')->nullable();
            $table->json('rhythm')->nullable();
            $table->json('jobs')->nullable();
            $table->json('sectors')->nullable();
            $table->json('further_studies')->nullable();
            $table->text('internship')->nullable();
            $table->json('partnerships')->nullable();
            $table->boolean('online_application')->default(false);
            $table->string('brochure_url')->nullable();
            $table->json('academic_calendar')->nullable();
            $table->date('last_verified_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['establishment_id', 'status']);
            $table->index(['status', 'registration_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
