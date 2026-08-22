<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignment_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('assignment_submissions', 'status')) {
                $table->enum('status', ['draft', 'submitted', 'graded'])->default('submitted')->after('file_name');
            }
        });
    }

    public function down(): void
    {
        //
    }
};
