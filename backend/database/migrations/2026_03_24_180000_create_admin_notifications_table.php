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
        Schema::create('admin_notifications', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('type'); // approval, violation, update, inactive
            $blueprint->string('priority')->default('medium'); // high, medium, low
            $blueprint->string('title');
            $blueprint->text('message');
            $blueprint->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $blueprint->timestamp('read_at')->nullable();
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
