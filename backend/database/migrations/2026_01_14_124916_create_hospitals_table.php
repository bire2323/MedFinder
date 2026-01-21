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
        Schema::create('Hospital', function (Blueprint $table) {
            $table->id();
            $table->foreignId("HospitalAgentId")->constrained("users")->onDelete('cascade');
            $table->string('HospitalOwnershipType');
            $table->integer('LicenseNumber');
            $table->string('OfficialLicenseUpload');
            $table->string('WorkingHour');
            $table->string('Logo');

            $table->boolean("IsFullTimeService");
            $table->integer('EmergencyContact');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Hospital');
    }
};
