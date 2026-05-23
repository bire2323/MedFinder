<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drug_price_histories', function (Blueprint $table) {
            $table->foreignId('drug_batch_id')
                ->nullable()
                ->after('pharmacy_id')
                ->constrained('drug_batches')
                ->nullOnDelete();

            $table->decimal('old_cost_price', 10, 2)->nullable()->after('old_price');
            $table->decimal('new_cost_price', 10, 2)->nullable()->after('new_price');
            $table->string('reason')->nullable()->after('new_cost_price');
            $table->text('notes')->nullable()->after('reason');
            $table->foreignId('changed_by')
                ->nullable()
                ->after('notes')
                ->constrained('users')
                ->nullOnDelete();
        });

        Schema::table('drug_price_histories', function (Blueprint $table) {
            $table->index(['drug_batch_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('drug_price_histories', function (Blueprint $table) {
            $table->dropForeign(['drug_batch_id']);
            $table->dropForeign(['changed_by']);
            $table->dropIndex(['drug_batch_id', 'created_at']);
            $table->dropColumn([
                'drug_batch_id',
                'old_cost_price',
                'new_cost_price',
                'reason',
                'notes',
                'changed_by',
            ]);
        });
    }
};
