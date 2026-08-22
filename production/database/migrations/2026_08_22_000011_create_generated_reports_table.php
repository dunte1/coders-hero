<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generated_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_type');
            $table->string('title');
            $table->string('period');
            $table->date('generated_at');
            $table->string('file_path');
            $table->string('file_size')->nullable();
            $table->string('format')->default('pdf');
            $table->uuid('generated_by')->nullable()->constrained()->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('report_type');
            $table->index('period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_reports');
    }
};
