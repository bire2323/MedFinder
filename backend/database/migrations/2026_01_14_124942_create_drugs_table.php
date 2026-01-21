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
        Schema::create('Drug', function (Blueprint $table) {
            $table->id();
            $table->string('GenericName');
            $table->string('BrandNameEn');
            $table->string('BrandNameAm');
            $table->string('Manufacturer')->nullable();
            $table->string("DrugCategory")->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Drug');
    }
};
