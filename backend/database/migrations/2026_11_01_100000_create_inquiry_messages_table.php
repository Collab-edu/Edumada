<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Conversation d'une demande d'information. Les notes déjà envoyées deviennent des messages ;
     * le statut ne sert plus qu'à savoir si l'établissement doit répondre (« new » = à répondre).
     */
    public function up(): void
    {
        Schema::create('inquiry_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inquiry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sender', 20);
            $table->text('body');
            $table->timestamps();
            $table->index(['inquiry_id', 'id']);
        });

        $notes = DB::table('inquiry_status_changes')
            ->join('inquiries', 'inquiries.id', '=', 'inquiry_status_changes.inquiry_id')
            ->where('inquiries.type', 'information')
            ->whereNotNull('inquiry_status_changes.note')
            ->orderBy('inquiry_status_changes.id')
            ->get(['inquiry_status_changes.inquiry_id', 'inquiry_status_changes.user_id', 'inquiry_status_changes.note', 'inquiry_status_changes.created_at']);

        foreach ($notes as $note) {
            DB::table('inquiry_messages')->insert([
                'inquiry_id' => $note->inquiry_id,
                'user_id' => $note->user_id,
                'sender' => 'establishment',
                'body' => $note->note,
                'created_at' => $note->created_at,
                'updated_at' => $note->created_at,
            ]);
        }

        DB::table('inquiries')->where('type', 'information')->where('status', '!=', 'new')->update(['status' => 'in_review']);
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiry_messages');
    }
};
