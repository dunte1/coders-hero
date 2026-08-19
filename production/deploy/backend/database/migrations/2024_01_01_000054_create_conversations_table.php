<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('guardian_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('teacher_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['guardian_user_id', 'teacher_user_id', 'student_id'], 'conversation_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
