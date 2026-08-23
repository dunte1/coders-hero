<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_school_id')->constrained()->cascadeOnDelete();
            $table->string('contract_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('value', 12, 2)->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('renewal_date')->nullable();
            $table->enum('status', ['draft', 'active', 'expired', 'terminated'])->default('draft');
            $table->string('document_path', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_contracts');
    }
};
