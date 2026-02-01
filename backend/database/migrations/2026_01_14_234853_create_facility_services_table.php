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
        Schema::create('facility_services', function (Blueprint $table) {
            $table->id();

            // Polymorphic relation (hospital or pharmacy)
            $table->unsignedBigInteger('addressable_id');
            $table->string('addressable_type');

             $table->foreignId('service_id')
          ->constrained('services')
          ->cascadeOnDelete();

            // Facility service details
            $table->boolean('is_available')->default(false);
            $table->string('notes')->nullable();

            $table->timestamps();

            // Polymorphic index
            $table->index(['addressable_id', 'addressable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facility_services');
    }
};
