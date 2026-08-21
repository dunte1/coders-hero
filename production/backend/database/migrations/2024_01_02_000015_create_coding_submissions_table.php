<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coding_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained('coding_exercises')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->longText('code');
            $table->enum('status', ['correct', 'incorrect', 'partial', 'pending'])->default('pending');
            $table->decimal('score', 6, 2)->default(0);
            $table->json('result')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['exercise_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coding_submissions');
    }
};
