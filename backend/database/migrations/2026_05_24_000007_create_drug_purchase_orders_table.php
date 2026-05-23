<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drug_purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', [
                'DRAFT',
                'PENDING_APPROVAL',
                'APPROVED',
                'ORDERED',
                'PARTIALLY_RECEIVED',
                'RECEIVED',
                'CANCELLED',
            ])->default('DRAFT');
            $table->timestamp('ordered_at')->nullable();
            $table->timestamp('expected_delivery_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 10)->default('ETB');
            $table->text('notes')->nullable();
            $table->string('reference_number')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['pharmacy_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drug_purchase_orders');
    }
};
