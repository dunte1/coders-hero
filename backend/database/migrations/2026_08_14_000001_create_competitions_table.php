<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', [
                'hackathon',
                'robotics_challenge',
                'ai_challenge',
                'web_design',
                'mobile_app',
            ])->default('hackathon');
            $table->text('description')->nullable();
            $table->json('rules')->nullable();
            $table->string('venue')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->dateTime('registration_deadline')->nullable();
            $table->unsignedInteger('min_team_size')->default(1);
            $table->unsignedInteger('max_team_size')->default(4);
            $table->enum('status', [
                'draft',
                'registration_open',
                'registration_closed',
                'ongoing',
                'completed',
                'cancelled',
            ])->default('draft');
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'type']);
            $table->index('start_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};
