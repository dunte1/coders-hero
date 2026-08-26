<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code')->unique();
            $table->string('name');
            $table->foreignId('asset_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->string('serial_number')->nullable();
            $table->string('qr_code')->nullable()->unique();
            $table->enum('status', ['available', 'assigned', 'in_maintenance', 'disposed', 'lost'])->default('available')->index();
            $table->enum('condition', ['new', 'good', 'fair', 'poor'])->default('good');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 14, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->text('notes')->nullable();
            // Robotics Lab integration: link an inventory asset to its robotics equipment record.
            $table->foreignId('robotics_equipment_id')->nullable()->constrained('robotics_equipment')->nullOnDelete();
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
