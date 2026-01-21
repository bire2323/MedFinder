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
        Schema::create('Service', function (Blueprint $table) {
            $table->id();
            $table->string('ServiceNameEn');
            $table->string('ServiceNameAm');
            $table->string('ServiceCategoryNameEn')->nullable();
            $table->string('ServiceCategoryNameAm')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Service');
    }
};
