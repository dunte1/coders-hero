<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('popups', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('image')->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->enum('type', ['advert', 'seasonal_greeting'])->default('advert');
            $table->string('animation_style')->default('fade');
            $table->string('overlay_style')->default('dark');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('frequency', ['every_visit', 'once_per_session', 'once_per_day', 'once_ever'])->default('once_per_session');
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('popups');
    }
};
