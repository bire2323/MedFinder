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
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();

            // User who owns the chat session
            $table->foreignId('patient_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
  $table->foreignId('pharmacy_id')
  ->nullable()
                  ->constrained('pharmacies')
                  
                  ->cascadeOnDelete();
 $table->foreignId('hospital_id')
 ->nullable()
                  ->constrained('hospitals')
                  ->cascadeOnDelete();
            $table->text('status');
            $table->text('language');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_sessions');
    }
};
