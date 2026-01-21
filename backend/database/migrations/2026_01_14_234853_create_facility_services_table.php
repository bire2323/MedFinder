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
        Schema::create('FacilityService', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('addressable_id');          // the ID of hospital or pharmacy
            $table->string('addressable_type');
            $table->boolean('IsAvailable');
            $table->string('Notes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('FacilityService');
    }
};
