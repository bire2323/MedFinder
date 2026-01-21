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
        Schema::create('HospitalDepartment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hospitalId')->constrained('Hospital')->onDelete('cascade');
            $table->foreignId('departmentId')->constrained('Department')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('HospitalDepartment');
    }
};
