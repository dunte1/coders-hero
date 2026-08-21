<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->enum('fee_type', ['tuition', 'lunch', 'transport', 'exam', 'uniform', 'activity', 'other'])->default('other');
            $table->decimal('amount', 10, 2);
            $table->string('term', 60)->nullable();
            $table->string('grade_level', 60)->nullable();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'fee_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
