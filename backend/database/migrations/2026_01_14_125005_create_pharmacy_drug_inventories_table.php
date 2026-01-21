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
        Schema::create('PharmacyDrugInventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('PharmacyId')->constrained("Pharmacy")->onDelete('cascade');
            $table->foreignId('DrugId')->constrained("Drug")->onDelete('cascade');
            $table->integer('QuantityAvailable');
            $table->integer('UnitCost');
            $table->integer('SellingPrice');
            $table->string('Status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PharmacyDrugInventory');
    }
};
