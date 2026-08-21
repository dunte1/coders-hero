<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('category', 80);
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');
            $table->foreignUuid('recorded_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('receipt_ref', 120)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['category', 'expense_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
