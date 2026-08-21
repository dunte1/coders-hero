<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competition_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_team_id')->constrained('competition_teams')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->enum('role', ['leader', 'member'])->default('member');
            $table->timestamps();

            $table->unique(['competition_team_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_team_members');
    }
};
