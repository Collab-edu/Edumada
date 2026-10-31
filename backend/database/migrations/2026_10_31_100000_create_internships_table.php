<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Offres de stage publiées par l'administration Edumada pour des sociétés sans compte.
     */
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('company_name');
            $table->string('company_logo', 2048)->nullable();
            $table->string('title');
            $table->foreignId('domain_id')->nullable()->constrained()->nullOnDelete();
            $table->string('city');
            $table->unsignedSmallInteger('duration_months')->nullable();
            $table->string('modality', 20);
            $table->string('registration', 20);
            $table->date('starts_on')->nullable();
            $table->string('contact');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};
