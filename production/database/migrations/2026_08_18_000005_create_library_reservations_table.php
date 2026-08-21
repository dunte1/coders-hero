<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('library_resources')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('reserved_at');
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['pending', 'fulfilled', 'cancelled'])->default('pending')->index();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->unique(['resource_id', 'user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_reservations');
    }
};
