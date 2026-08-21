<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competition_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->string('name');
            $table->string('project_title')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['registered', 'submitted', 'disqualified'])->default('registered');
            $table->foreignId('leader_student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('submission_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['competition_id', 'name']);
            $table->index(['competition_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_teams');
    }
};
