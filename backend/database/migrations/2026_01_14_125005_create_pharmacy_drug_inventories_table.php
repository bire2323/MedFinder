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
        Schema::create('pharmacy_drug_inventories', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('pharmacy_id')
                  ->constrained('pharmacies')
                  ->cascadeOnDelete();

            $table->foreignId('drug_id')
                  ->constrained('drugs')
                  ->cascadeOnDelete();

            // Inventory fields
            $table->integer('stock')->default(0);
            $table->decimal('price', 10, 2)->default(0);
            $table->string('about_drug_en');
            $table->string('about_drug_am')->nullable();
            $table->boolean('prescription_required')->default(false);
            $table->date('expire_date');
        
            // Status
            $table->enum('status', ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'])
                  ->default('AVAILABLE');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacy_drug_inventories');
    }
};
