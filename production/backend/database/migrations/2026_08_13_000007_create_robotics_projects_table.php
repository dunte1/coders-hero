<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('robotics_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->nullable()->constrained('robotics_teams')->nullOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('students')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('category', ['class', 'competition', 'personal'])->default('class');
            $table->enum('status', ['planning', 'in_progress', 'completed', 'archived'])->default('planning');
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('goals')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'category']);
            $table->index(['team_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robotics_projects');
    }
};
