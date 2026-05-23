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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();

            // Polymorphic relation (hospital or pharmacy)
            $table->unsignedBigInteger('addressable_id');
            $table->string('addressable_type');

            // Normalized region and city references
            $table->foreignId('region_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();

            // Address details
            $table->string('description_en')->nullable();
            $table->string('description_am')->nullable();
            $table->string('kebele');

            // Coordinates
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('address_type');

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index(['addressable_id', 'addressable_type']);
            $table->index('region_id');
            $table->index('city_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
