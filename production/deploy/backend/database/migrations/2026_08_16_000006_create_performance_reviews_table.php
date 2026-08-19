<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('reviewer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('review_period')->nullable();
            $table->date('review_date');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('goals')->nullable();
            $table->text('achievements')->nullable();
            $table->text('areas_to_improve')->nullable();
            $table->text('feedback')->nullable();
            $table->enum('status', ['draft', 'submitted', 'acknowledged'])->default('draft');
            $table->timestamps();

            $table->index('employee_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
};
