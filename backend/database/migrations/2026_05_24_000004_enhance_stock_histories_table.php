<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_histories', function (Blueprint $table) {
            $table->foreignId('drug_batch_id')
                ->nullable()
                ->after('inventory_id')
                ->constrained('drug_batches')
                ->nullOnDelete();

            $table->foreignId('pharmacy_batch_inventory_id')
                ->nullable()
                ->after('drug_batch_id')
                ->constrained('pharmacy_batch_inventories')
                ->nullOnDelete();

            $table->integer('old_quantity')->nullable()->after('new_stock');
            $table->integer('new_quantity')->nullable()->after('old_quantity');

            $table->string('reference_type')->nullable()->after('reason');
            $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type');
            $table->text('notes')->nullable()->after('reference_id');
            $table->string('ip_address', 45)->nullable()->after('performed_by');
        });

        Schema::table('stock_histories', function (Blueprint $table) {
            $table->index(['drug_batch_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::table('stock_histories', function (Blueprint $table) {
            $table->dropForeign(['drug_batch_id']);
            $table->dropForeign(['pharmacy_batch_inventory_id']);
            $table->dropIndex(['drug_batch_id', 'created_at']);
            $table->dropIndex(['reference_type', 'reference_id']);
            $table->dropColumn([
                'drug_batch_id',
                'pharmacy_batch_inventory_id',
                'old_quantity',
                'new_quantity',
                'reference_type',
                'reference_id',
                'notes',
                'ip_address',
            ]);
        });
    }
};
