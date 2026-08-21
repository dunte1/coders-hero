<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('robotics_equipment_reservations');
        Schema::create('robotics_equipment_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('robotics_equipment')->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->constrained('robotics_teams')->nullOnDelete();
            $table->foreignUuid('reserved_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->string('purpose')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->foreignUuid('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['equipment_id', 'status']);
            $table->index(['reserved_by_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robotics_equipment_reservations');
    }
};
