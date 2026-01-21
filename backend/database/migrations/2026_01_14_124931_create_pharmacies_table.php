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
        Schema::create('Pharmacy', function (Blueprint $table) {
            $table->id();
            $table->foreignId("PharmacyAgentId")->constrained("users")->onDelete('cascade');
            $table->string('PharmacyName');
            $table->integer('LicenceNumber');
            $table->string('PharmacyLicenseCategory');
            $table->integer('PharmacyLicenseUpload');
            $table->string('WorkingHour');
            $table->string('Logo');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Pharmacy');
    }
};
