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
        Schema::create('Department', function (Blueprint $table) {
            $table->id();
            $table->string('DepartmentNameEn');
            $table->string('DepartmentNameAm');
            $table->string('DepartmentCategoryNameEn')->nullable();
            $table->string('DepartmentCategoryNameAm')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Department');
    }
};
