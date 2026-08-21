<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('robotics_maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('robotics_equipment')->cascadeOnDelete();
            $table->foreignUuid('recorded_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['repair', 'calibration', 'inspection', 'cleaning', 'replacement'])->default('inspection');
            $table->text('issue_description')->nullable();
            $table->text('resolution')->nullable();
            $table->enum('status', ['reported', 'in_progress', 'resolved'])->default('reported');
            $table->decimal('cost', 12, 2)->nullable();
            $table->timestamp('maintenance_date')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['equipment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robotics_maintenance_records');
    }
};
