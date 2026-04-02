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
        Schema::create('pharmacies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_agent_id') ->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('pharmacy_name_en');
            $table->string('pharmacy_name_am');
            $table->string('license_number');
            $table->string('pharmacy_license_category');
            $table->string('pharmacy_license_upload');

            $table->string('working_hour');
            $table->string('contact_phone', 10)->unique()->nullable();
            $table->string('contact_email')->unique()->nullable();
            $table->string('address_description_en')->nullable();
            $table->string('address_description_am')->nullable();
            $table->string('logo')->nullable(); 
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])
                  ->default('PENDING');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacies');
    }
};
