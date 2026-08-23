<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->decimal('gross_salary', 12, 2)->nullable()->after('gross_amount');
            $table->decimal('net_salary', 12, 2)->nullable()->after('net_amount');
            $table->decimal('nssf', 12, 2)->nullable()->after('deductions_amount');
            $table->decimal('shif', 12, 2)->nullable()->after('nssf');
            $table->decimal('paye', 12, 2)->nullable()->after('shif');
        });
    }

    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn(['gross_salary', 'net_salary', 'nssf', 'shif', 'paye']);
        });
    }
};
