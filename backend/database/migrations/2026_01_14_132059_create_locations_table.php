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
        Schema::create('Location', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('addressable_id');          // the ID of hospital or pharmacy
            $table->string('addressable_type');
            $table->string("Region");
            $table->string("Zone");
            $table->string("City");
            $table->string("SubCity");
            $table->string("Kebele");
            $table->decimal('Latitude', 20, 20);
            $table->decimal('Longitude', 20, 20);
            $table->string("AddressType");
            $table->softDeletes();
            $table->timestamps();
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
