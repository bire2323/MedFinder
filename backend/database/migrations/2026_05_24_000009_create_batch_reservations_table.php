<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batch_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_batch_inventory_id')
                ->constrained('pharmacy_batch_inventories')
                ->cascadeOnDelete();
            $table->string('reservable_type');
            $table->unsignedBigInteger('reservable_id');
            $table->integer('quantity_reserved');
            $table->timestamp('reserved_at');
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'])->default('ACTIVE');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['pharmacy_batch_inventory_id', 'status']);
            $table->index(['reservable_type', 'reservable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch_reservations');
    }
};
