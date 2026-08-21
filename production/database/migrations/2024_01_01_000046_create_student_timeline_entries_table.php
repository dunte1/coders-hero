<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_timeline_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('event_type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('occurred_on');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('event_type');
            $table->index('occurred_on');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_timeline_entries');
    }
};
