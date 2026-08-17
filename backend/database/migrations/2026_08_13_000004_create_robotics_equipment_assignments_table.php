<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('robotics_equipment_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('robotics_equipment')->cascadeOnDelete();
            $table->morphs('assignable');
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('expected_return_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->text('note')->nullable();
            $table->foreignUuid('assigned_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['equipment_id', 'returned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robotics_equipment_assignments');
    }
};
