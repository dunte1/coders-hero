<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('invoice_id')->nullable()->after('fee_id')->constrained('invoices')->nullOnDelete();
            $table->foreignId('fee_id')->nullable()->change();
            $table->enum('method', ['cash', 'card', 'bank_transfer', 'online', 'mpesa'])->default('online')->change();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropColumn('invoice_id');
            $table->foreignId('fee_id')->nullable(false)->change();
            $table->enum('method', ['cash', 'card', 'bank_transfer', 'online'])->default('online')->change();
        });
    }
};
