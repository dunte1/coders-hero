<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('term', 60);
            $table->string('academic_year', 20);
            $table->date('issued_at');
            $table->string('overall_grade', 20)->nullable();
            $table->decimal('average_score', 5, 2)->nullable();
            $table->text('teacher_notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'term']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_cards');
    }
};
