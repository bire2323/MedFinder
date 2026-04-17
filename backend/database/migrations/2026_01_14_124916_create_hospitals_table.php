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
        Schema::create('hospitals', function (Blueprint $table) {
            $table->id();

            // Hospital registered by hospital agent (user)
            $table->foreignId('hospital_agent_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Admin who approved/rejected hospital (user)
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
         $table->string("hospital_name_en");
         $table->string("hospital_name_am");
            $table->string('hospital_ownership_type');
            $table->string('license_number');
            $table->string('official_license_upload');
            $table->string('working_hour');
            $table->string('logo')->nullable();

            $table->boolean('is_full_time_service')->default(false);
            $table->string('emergency_contact');
            $table->string('contact_email');
            $table->string('address_description_en')->nullable();
            $table->string('address_description_am')->nullable();


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
        Schema::dropIfExists('hospitals');
    }
};
