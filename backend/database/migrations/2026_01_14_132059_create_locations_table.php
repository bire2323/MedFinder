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

            // Address details
            $table->string('region_en');
            $table->string('region_am');
            $table->string('zone_en');
            $table->string('zone_am');
             
            $table->string('sub_city_en');
            $table->string('sub_city_am');
            $table->string('kebele');

            // Coordinates
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->string('address_type');

            $table->softDeletes();
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
        Schema::dropIfExists('locations');
    }
};
