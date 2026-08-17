<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coding_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('skill', 80);
            $table->integer('level')->default(1);
            $table->integer('progress')->default(0);
            $table->string('badge', 80)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'skill']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coding_progress');
    }
};
