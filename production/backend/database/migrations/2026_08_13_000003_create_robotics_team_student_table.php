<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('robotics_team_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('robotics_teams')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->enum('role', ['leader', 'member'])->default('member');
            $table->timestamps();

            $table->unique(['team_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robotics_team_student');
    }
};
