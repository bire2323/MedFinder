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
        Schema::create('low_stock_expiration_alerts', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('pharmacy_id')
                  ->constrained('pharmacies')
                  ->cascadeOnDelete();

            $table->foreignId('drug_id')
                  ->constrained('drugs')
                  ->cascadeOnDelete();

            // Alert details
            $table->dateTime('expiration_date');
            $table->dateTime('notified_date');
            $table->string('notification_message');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('low_stock_expiration_alerts');
    }
};
