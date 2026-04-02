<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pharmacy_drug_inventories', function (Blueprint $table) {
            $table->decimal('cost_price', 10, 2)->nullable()->after('price');
            $table->string('manufacturer')->nullable()->after('cost_price');
            $table->string('category')->nullable()->after('manufacturer');
            $table->string('dosage_form')->nullable()->after('category');
            $table->integer('low_stock_threshold')->default(10)->after('stock');
            $table->boolean('is_available')->default(true)->after('status');
            $table->string('batch_number')->nullable()->after('expire_date');
            $table->softDeletes();
        });

        Schema::create('stock_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained('pharmacy_drug_inventories')->cascadeOnDelete();
            $table->integer('old_stock')->default(0);
            $table->integer('new_stock')->default(0);
            $table->integer('change_amount');
            $table->enum('type', ['MANUAL', 'SALE', 'ADJUSTMENT', 'CORRECTION'])->default('MANUAL');
            $table->string('reason')->nullable();
            $table->foreignId('performed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_histories');
        
        Schema::table('pharmacy_drug_inventories', function (Blueprint $table) {
            $table->dropColumn([
                'cost_price', 
                'manufacturer', 
                'category', 
                'dosage_form', 
                'low_stock_threshold', 
                'is_available', 
                'batch_number'
            ]);
            $table->dropSoftDeletes();
        });
    }
};
