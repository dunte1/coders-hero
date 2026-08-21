<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('library_categories')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('library_authors')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('resource_type', ['ebook', 'video', 'notes', 'past_paper', 'coding_resource', 'robotics_manual'])->default('ebook')->index();
            $table->string('file_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('language', 10)->default('en');
            $table->boolean('is_public')->default(true);
            $table->boolean('download_allowed')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('view_count')->default(0);
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_public', 'is_active']);
            $table->index(['category_id', 'resource_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_resources');
    }
};
