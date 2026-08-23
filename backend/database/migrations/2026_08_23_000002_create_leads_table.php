<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('organization')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->enum('source', ['contact_form', 'free_trial', 'referral', 'social', 'other'])->default('other');
            $table->enum('status', ['new', 'contacted', 'qualified', 'won', 'lost'])->default('new');
            $table->foreignUuid('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('next_follow_up_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
