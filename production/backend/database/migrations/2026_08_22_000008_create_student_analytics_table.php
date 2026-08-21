<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->integer('lessons_completed')->default(0);
            $table->integer('quizzes_taken')->default(0);
            $table->integer('exercises_solved')->default(0);
            $table->integer('minutes_learned')->default(0);
            $table->integer('points_earned')->default(0);
            $table->timestamps();
            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_analytics');
    }
};
