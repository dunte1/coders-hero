<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('reversal_reason')->nullable()->after('paid_by_user_id');
            $table->timestamp('reversed_at')->nullable()->after('reversal_reason');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['reversal_reason', 'reversed_at']);
        });
    }
};
