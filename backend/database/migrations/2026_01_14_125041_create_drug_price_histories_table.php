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
        Schema::create('DrugPriceHistory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drugId')->constrained("Drug")->onDelete('cascade');
            $table->foreignId("pharmacyId")->constrained("Pharmacy")->onDelete('cascade');
            $table->decimal('OldPrice', 10, 2);
            $table->decimal('NewPrice', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('DrugPriceHistory');
    }
};
