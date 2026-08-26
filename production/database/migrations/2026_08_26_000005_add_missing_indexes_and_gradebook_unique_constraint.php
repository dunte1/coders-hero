<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = DB::connection()->getPdo();

        $indexes = [
            ['users', 'is_active'],
            ['students', 'guardian_id'],
            ['students', 'status'],
            ['employees', 'status'],
            ['enrollments', 'user_id'],
            ['invoices', 'due_date'],
            ['payments', 'paid_at'],
            ['conversations', 'last_message_at'],
            ['announcements', 'is_pinned'],
        ];

        foreach ($indexes as [$table, $column]) {
            $indexName = "{$table}_{$column}_index";
            try {
                $stmt = $pdo->prepare("SHOW INDEX FROM `{$table}` WHERE Key_name = ?");
                $stmt->execute([$indexName]);
                if (!$stmt->fetch()) {
                    Schema::table($table, fn(Blueprint $t) => $t->index($column));
                }
            } catch (\Exception $e) {
                // Table or column may not exist — skip
            }
        }

        $compositeIndexes = [
            ['students', ['status', 'grade']],
            ['enrollments', ['user_id', 'status']],
            ['attendances', ['student_id', 'attendance_date']],
            ['fees', ['student_id', 'status']],
            ['expenses', ['category', 'expense_date']],
            ['expenses', 'approval_status'],
            ['budgets', ['category', 'fiscal_year']],
        ];

        foreach ($compositeIndexes as [$table, $columns]) {
            $indexName = $table . '_' . (is_array($columns) ? implode('_', $columns) : $columns) . '_index';
            try {
                $stmt = $pdo->prepare("SHOW INDEX FROM `{$table}` WHERE Key_name = ?");
                $stmt->execute([$indexName]);
                if (!$stmt->fetch()) {
                    Schema::table($table, fn(Blueprint $t) => $t->index($columns));
                }
            } catch (\Exception $e) {
                // Table may not exist — skip
            }
        }

        try {
            $stmt = $pdo->prepare("SHOW INDEX FROM `gradebook_entries` WHERE Key_name = ?");
            $stmt->execute(['gradebook_unique_entry']);
            if (!$stmt->fetch()) {
                Schema::table('gradebook_entries', fn(Blueprint $t) => $t->unique(['class_id', 'student_id', 'component', 'title'], 'gradebook_unique_entry'));
            }
        } catch (\Exception $e) {
            // Table may not exist — skip
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['guardian_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['status', 'grade']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['employment_status']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['user_id', 'status']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['due_date']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['paid_at']);
        });

        Schema::table('attendance', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'attendance_date']);
        });

        Schema::table('fees', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'status']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['last_message_at']);
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex(['is_pinned']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['category', 'expense_date']);
            $table->dropIndex(['approval_status']);
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->dropIndex(['category', 'fiscal_year']);
        });

        Schema::table('gradebook_entries', function (Blueprint $table) {
            $table->dropIndex('gradebook_unique_entry');
        });
    }
};
