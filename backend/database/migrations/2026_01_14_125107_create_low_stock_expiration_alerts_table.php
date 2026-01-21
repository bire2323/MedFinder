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
        Schema::create('LowStockExpirationAlert', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacyId')->constrained('Pharmacy')->onDelete('cascade');
            $table->foreignId('drugId')->constrained('Drug')->onDelete('cascade');
            $table->dateTime('ExpirationDate');
            $table->dateTime('NotifiedDate');
            $table->string('NotifionMessage');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('LowStockExpirationAlert');
    }
};
