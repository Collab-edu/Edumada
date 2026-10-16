<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fiches établissement et personnes autorisées à les gérer.
     */
    public function up(): void
    {
        Schema::create('establishments', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('initials', 10)->nullable();
            $table->string('sector', 20);
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('sub_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('city')->index();
            $table->string('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('social_links')->nullable();
            $table->json('infrastructures')->nullable();
            $table->string('accreditation')->nullable();
            $table->boolean('accreditation_verified')->default(false);
            $table->string('verification_status', 20)->default('unverified');
            $table->date('verified_at')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('admission_documents')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('photos')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'category_id']);
        });

        Schema::create('establishment_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20)->default('owner');
            $table->timestamps();

            $table->unique(['establishment_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('establishment_user');
        Schema::dropIfExists('establishments');
    }
};
