<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Campagnes Premium (emplacements sponsorisés) et statistiques agrégées par jour.
     */
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('call_to_action', 60)->nullable();
            $table->date('starts_on');
            $table->date('ends_on');
            $table->foreignId('target_category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('target_domain_id')->nullable()->constrained('domains')->nullOnDelete();
            $table->string('target_city')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['status', 'starts_on', 'ends_on']);
        });

        // Une ligne par jour, établissement, offre (0 = fiche établissement), campagne (0 = aucune) et mesure.
        Schema::create('daily_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('offer_id')->default(0);
            $table->unsignedBigInteger('campaign_id')->default(0);
            $table->string('metric', 30);
            $table->unsignedInteger('count')->default(0);

            $table->unique(['date', 'establishment_id', 'offer_id', 'campaign_id', 'metric'], 'daily_stats_unique');
            $table->index(['establishment_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_stats');
        Schema::dropIfExists('campaigns');
    }
};
