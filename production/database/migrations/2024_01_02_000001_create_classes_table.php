<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('teacher_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->string('room')->nullable();
            $table->string('color')->default('#2563eb');
            $table->json('schedule')->nullable();
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->integer('capacity')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['teacher_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
