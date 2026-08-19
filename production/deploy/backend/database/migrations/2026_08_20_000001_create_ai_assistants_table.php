<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_assistants', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category', 40)->default('general');
            $table->string('icon', 40)->default('Sparkles');
            $table->longText('system_prompt')->nullable();
            $table->string('model')->nullable();
            $table->unsignedInteger('max_tokens')->nullable();
            $table->decimal('temperature', 3, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_assistants');
    }
};
