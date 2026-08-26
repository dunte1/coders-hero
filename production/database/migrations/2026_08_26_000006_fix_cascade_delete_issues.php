<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Make expenses.recorded_by_user_id nullable
        try {
            Schema::table('expenses', function (Blueprint $table) {
                $table->foreignUuid('recorded_by_user_id')->nullable()->change();
            });
        } catch (\Exception $e) {
            // Column may already be nullable or don't exist
        }

        $pdo = DB::connection()->getPdo();

        // Fix conversations FK constraints — only modify if FKs exist
        $conversationFks = [
            ['conversations', 'guardian_user_id'],
            ['conversations', 'teacher_user_id'],
        ];

        foreach ($conversationFks as [$table, $column]) {
            $fkName = "{$table}_{$column}_foreign";
            try {
                $stmt = $pdo->prepare("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'");
                $stmt->execute([$table, $fkName]);
                if ($stmt->fetch()) {
                    Schema::table($table, function (Blueprint $t) use ($column) {
                        $t->dropForeign([$column]);
                        $t->foreign($column)->references('id')->on('users')->nullOnDelete();
                    });
                } else {
                    // FK doesn't exist — add it
                    Schema::table($table, function (Blueprint $t) use ($column) {
                        $t->foreign($column)->references('id')->on('users')->nullOnDelete();
                    });
                }
            } catch (\Exception $e) {
                // Column may not exist — skip
            }
        }

        // Fix messages.sender_user_id FK
        try {
            $stmt = $pdo->prepare("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND CONSTRAINT_NAME = 'messages_sender_user_id_foreign' AND CONSTRAINT_TYPE = 'FOREIGN KEY'");
            $stmt->execute();
            if ($stmt->fetch()) {
                Schema::table('messages', function (Blueprint $table) {
                    $table->dropForeign(['sender_user_id']);
                    $table->foreign('sender_user_id')->references('id')->on('users')->nullOnDelete();
                });
            } else {
                Schema::table('messages', function (Blueprint $table) {
                    $table->foreign('sender_user_id')->references('id')->on('users')->nullOnDelete();
                });
            }
        } catch (\Exception $e) {
            // Column or table may not exist — skip
        }
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignUuid('recorded_by_user_id')->nullable(false)->change();
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['guardian_user_id']);
            $table->dropForeign(['teacher_user_id']);
            $table->foreign('guardian_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('teacher_user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['sender_user_id']);
            $table->foreign('sender_user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
