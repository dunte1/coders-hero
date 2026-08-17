<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mpesa_transactions', function (Blueprint $table) {
            $table->foreignId('invoice_id')->nullable()->after('fee_id')->constrained('invoices')->nullOnDelete();
            $table->foreignId('payment_id')->nullable()->after('invoice_id')->constrained('payments')->nullOnDelete();
            $table->timestamp('reconciled_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('mpesa_transactions', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
            $table->dropForeign(['invoice_id']);
            $table->dropColumn(['payment_id', 'invoice_id', 'reconciled_at']);
        });
    }
};
