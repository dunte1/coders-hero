<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('approval_status', ['draft', 'pending', 'approved', 'rejected'])->default('draft')->after('amount');
            $table->foreignUuid('submitted_by')->nullable()->constrained('users')->nullOnDelete()->after('approval_status');
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('submitted_by');
            $table->text('rejection_reason')->nullable()->after('approved_by');
            $table->timestamp('approved_at')->nullable()->after('rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn([
                'approval_status',
                'submitted_by',
                'approved_by',
                'rejection_reason',
                'approved_at',
            ]);
        });
    }
};
