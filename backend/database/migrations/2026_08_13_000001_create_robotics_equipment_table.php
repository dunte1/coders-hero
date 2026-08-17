<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('robotics_equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['kit', 'arduino_board', 'lego_kit', 'sensor', 'microcontroller', 'component'])->default('component');
            $table->string('sku')->nullable();
            $table->string('manufacturer')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('quantity_total')->default(1);
            $table->unsignedInteger('quantity_available')->default(1);
            $table->string('location')->nullable();
            $table->enum('condition', ['new', 'good', 'fair', 'poor'])->default('good');
            $table->enum('status', ['active', 'retired'])->default('active');
            $table->string('qr_code')->nullable()->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robotics_equipment');
    }
};
