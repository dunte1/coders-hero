<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assistant_id')->constrained('ai_assistants')->cascadeOnDelete();
            $table->string('title')->default('New conversation');
            $table->string('status', 20)->default('active');
            $table->json('context')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'assistant_id']);
            $table->index(['user_id', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};
