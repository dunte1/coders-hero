<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignId('template_id')->nullable()->after('enrollment_id')->constrained('certificate_templates')->nullOnDelete();
            $table->string('qr_code')->nullable()->after('verification_code');
            $table->string('digital_signature')->nullable()->after('qr_code');
            $table->enum('status', ['issued', 'revoked'])->default('issued')->after('digital_signature')->index();
            $table->timestamp('revoked_at')->nullable()->after('status');
            $table->foreignUuid('revoked_by_user_id')->nullable()->after('revoked_at')->constrained('users')->nullOnDelete();
            $table->text('revoked_reason')->nullable()->after('revoked_by_user_id');
            $table->foreignUuid('issued_by_user_id')->nullable()->after('revoked_reason')->constrained('users')->nullOnDelete();
            $table->json('meta')->nullable()->after('issued_by_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('template_id');
            $table->dropConstrainedForeignId('revoked_by_user_id');
            $table->dropConstrainedForeignId('issued_by_user_id');
            $table->dropColumn(['qr_code', 'digital_signature', 'status', 'revoked_at', 'revoked_reason', 'meta']);
        });
    }
};
