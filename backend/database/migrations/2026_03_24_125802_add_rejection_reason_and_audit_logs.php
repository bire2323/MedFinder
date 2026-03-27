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
        Schema::table('hospitals', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
        });

        Schema::table('pharmacies', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
        });

        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('facility_id');
            $table->string('facility_type'); // 'hospital' or 'pharmacy'
            $table->string('action'); // 'approved' or 'rejected'
            $table->foreignId('reviewed_by')->constrained('users')->cascadeOnDelete();
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_logs');

        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });

        Schema::table('hospitals', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
};
