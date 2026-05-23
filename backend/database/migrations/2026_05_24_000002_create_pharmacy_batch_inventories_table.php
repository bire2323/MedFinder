<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_batch_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->cascadeOnDelete();
            $table->foreignId('drug_batch_id')->constrained('drug_batches')->cascadeOnDelete();
            $table->integer('quantity_received')->default(0);
            $table->integer('quantity_available')->default(0);
            $table->integer('quantity_reserved')->default(0);
            $table->integer('quantity_dispensed')->default(0);
            $table->integer('quantity_expired')->default(0);
            $table->integer('quantity_damaged')->default(0);
            $table->decimal('unit_cost_price', 10, 2)->nullable();
            $table->decimal('unit_selling_price', 10, 2)->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('first_dispensed_at')->nullable();
            $table->timestamp('last_dispensed_at')->nullable();
            $table->unsignedInteger('fifo_order')->nullable();
            $table->string('storage_location')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['ACTIVE', 'BLOCKED', 'EXPIRED', 'DAMAGED', 'ARCHIVED'])->default('ACTIVE');
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['pharmacy_id', 'drug_batch_id']);
            $table->index(['pharmacy_id', 'status']);
            $table->index(['pharmacy_id', 'fifo_order']);
            $table->index('received_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_batch_inventories');
    }
};
