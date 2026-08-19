<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('category')->nullable()->index()->after('type');
            $table->string('channel')->default('in_app')->after('category');
            $table->string('status')->default('sent')->index()->after('channel');
            $table->string('link')->nullable()->after('data');
            $table->json('metadata')->nullable()->after('link');
            $table->timestamp('sent_at')->nullable()->after('metadata');
            $table->timestamp('delivered_at')->nullable()->after('sent_at');
            $table->timestamp('failed_at')->nullable()->after('delivered_at');
            $table->string('error_message')->nullable()->after('failed_at');
            $table->unsignedInteger('retry_count')->default(0)->after('error_message');
            $table->timestamp('last_retried_at')->nullable()->after('retry_count');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['notifiable_type', 'notifiable_id', 'category']);
            $table->dropIndex(['notifiable_type', 'notifiable_id', 'status']);
            $table->dropColumn([
                'category', 'channel', 'status', 'link', 'metadata', 'sent_at',
                'delivered_at', 'failed_at', 'error_message', 'retry_count', 'last_retried_at',
            ]);
        });
    }
};
