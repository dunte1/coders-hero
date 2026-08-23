<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_projects', function (Blueprint $table) {
            $table->unsignedInteger('version_number')->default(1)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('student_projects', function (Blueprint $table) {
            $table->dropColumn('version_number');
        });
    }
};
