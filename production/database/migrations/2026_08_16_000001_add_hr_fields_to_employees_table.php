<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('position_id');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->string('national_id')->nullable()->after('gender');
            $table->string('address')->nullable()->after('national_id');
            $table->string('emergency_contact')->nullable()->after('address');
            $table->string('emergency_phone')->nullable()->after('emergency_contact');
            $table->string('bank_name')->nullable()->after('emergency_phone');
            $table->string('bank_account_number')->nullable()->after('bank_name');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'national_id',
                'address',
                'emergency_contact',
                'emergency_phone',
                'bank_name',
                'bank_account_number',
            ]);
        });
    }
};
