<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('category', 80);
            $table->decimal('allocated_amount', 10, 2);
            $table->decimal('spent_amount', 10, 2)->default(0);
            $table->integer('fiscal_year');
            $table->string('period', 40)->default('annual'); // annual, q1, q2, q3, q4
            $table->timestamps();

            $table->unique(['category', 'fiscal_year', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
