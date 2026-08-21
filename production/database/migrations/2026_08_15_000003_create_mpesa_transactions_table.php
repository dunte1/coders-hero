<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mpesa_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('merchant_request_id', 100)->index();
            $table->string('checkout_request_id', 100)->unique();
            $table->integer('result_code')->nullable();
            $table->string('result_desc', 255)->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('mpesa_receipt_number', 50)->nullable()->unique();
            $table->string('phone_number', 20);
            $table->timestamp('transaction_date')->nullable();
            $table->foreignId('fee_id')->nullable()->constrained('fees')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->json('raw_payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mpesa_transactions');
    }
};
