<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            if (!Schema::hasColumn('admissions', 'email')) {
                $table->string('email')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('admissions', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('admissions', 'address')) {
                $table->string('address')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('admissions', 'source')) {
                $table->string('source')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            $table->dropColumn(['email', 'phone', 'address', 'source']);
        });
    }
};
