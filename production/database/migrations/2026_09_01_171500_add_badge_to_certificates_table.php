<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('badge_name')->nullable()->after('meta');
            $table->string('badge_icon')->nullable()->after('badge_name');
            $table->string('badge_color')->nullable()->default('#6366f1')->after('badge_icon');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn(['badge_name', 'badge_icon', 'badge_color']);
        });
    }
};
