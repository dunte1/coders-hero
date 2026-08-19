<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->string('description');
            $table->longText('long_description')->nullable();
            $table->enum('category', ['coding', 'robotics', 'stem']);
            $table->string('level')->default('beginner');
            $table->string('age_group')->nullable();
            $table->unsignedInteger('duration_weeks')->nullable();
            $table->unsignedInteger('sessions_per_week')->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->string('price_suffix')->nullable();
            $table->string('image')->nullable();
            $table->json('curriculum')->nullable();
            $table->json('outcomes')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
