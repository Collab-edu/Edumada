<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Détails des offres de stage et candidatures reçues dans le back-office (CV et lettre de motivation).
     */
    public function up(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->text('missions')->nullable()->after('description');
            $table->text('profile')->nullable()->after('missions');
            $table->text('benefits')->nullable()->after('profile');
            $table->string('allowance')->nullable()->after('benefits');
            $table->date('deadline')->nullable()->after('starts_on');
            $table->dropColumn('contact');
        });

        Schema::create('internship_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('phone', 30)->nullable();
            $table->string('cv_path');
            $table->string('cv_name');
            $table->string('letter_path');
            $table->string('letter_name');
            $table->timestamps();
            $table->unique(['internship_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_applications');

        Schema::table('internships', function (Blueprint $table) {
            $table->dropColumn(['missions', 'profile', 'benefits', 'allowance', 'deadline']);
            $table->string('contact')->default('');
        });
    }
};
