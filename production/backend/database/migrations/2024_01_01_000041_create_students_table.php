<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->unique();
            $table->foreignId('guardian_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('photo')->nullable();
            $table->string('grade')->nullable();
            $table->string('branch')->nullable();
            $table->date('admission_date')->nullable();
            $table->enum('status', ['pending', 'active', 'suspended', 'withdrawn', 'transferred', 'graduated'])->default('pending');
            $table->string('qr_code')->nullable()->unique();
            $table->date('graduation_date')->nullable();
            $table->text('medical_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('grade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
