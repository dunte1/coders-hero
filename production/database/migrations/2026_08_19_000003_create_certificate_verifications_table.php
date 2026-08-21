<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('certificate_id')->constrained('certificates')->cascadeOnDelete();
            $table->string('verifier_ip', 45)->nullable();
            $table->string('verifier_user_agent')->nullable();
            $table->timestamp('verified_at');
            $table->string('outcome', 20)->default('valid')->index();
            $table->timestamps();

            $table->index('verified_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_verifications');
    }
};
