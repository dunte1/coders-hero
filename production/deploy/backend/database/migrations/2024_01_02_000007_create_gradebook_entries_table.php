<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gradebook_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('teacher_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->enum('component', ['assignment', 'exam', 'quiz', 'participation', 'homework', 'project', 'final'])->default('assignment');
            $table->string('title');
            $table->decimal('score', 8, 2)->default(0);
            $table->decimal('max_score', 8, 2)->default(100);
            $table->decimal('weight', 5, 2)->default(1);
            $table->date('graded_on')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->index(['class_id', 'student_id']);
            $table->index(['course_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gradebook_entries');
    }
};
