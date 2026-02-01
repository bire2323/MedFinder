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

            // Pharmacy registered by pharmacy agent (user)
            $table->foreignId('pharmacy_agent_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Admin who approves/rejects pharmacy
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('pharmacy_name_en');
            $table->string('pharmacy_name_am');
            $table->string('license_number');
            $table->string('pharmacy_license_category');
            $table->string('pharmacy_license_upload');

            $table->string('working_hour');
            $table->string('address_description')->nullable();
            $table->string('logo')->nullable();

            // Approval status
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
