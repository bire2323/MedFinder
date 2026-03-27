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
        Schema::rename('admin_notifications', 'notifications');
        Schema::table('notifications', function (Blueprint $table) {
            $table->renameColumn('admin_id', 'user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->renameColumn('user_id', 'admin_id');
        });
        Schema::rename('notifications', 'admin_notifications');
    }
};
