<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competition_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->foreignId('competition_team_id')->constrained('competition_teams')->cascadeOnDelete();
            $table->foreignId('criterion_id')->constrained('competition_criteria')->cascadeOnDelete();
            $table->foreignUuid('judge_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('score');
            $table->text('remarks')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignUuid('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->unique(['competition_team_id', 'criterion_id', 'judge_user_id'], 'competition_scores_unique_entry');
            $table->index(['competition_id', 'judge_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_scores');
    }
};
