<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('free_trial_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('parent_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('child_name');
            $table->string('grade');
            $table->string('status')->default('pending'); // pending, contacted, scheduled, completed, converted
            $table->text('notes')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('free_trial_bookings');
    }
};
