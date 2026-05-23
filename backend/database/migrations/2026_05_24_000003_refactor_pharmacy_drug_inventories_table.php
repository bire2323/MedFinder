<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pharmacy_drug_inventories', function (Blueprint $table) {
            $table->timestamp('last_stock_update')->nullable()->after('status');
            $table->timestamp('last_expiry_check')->nullable()->after('last_stock_update');
        });

        Schema::table('pharmacy_drug_inventories', function (Blueprint $table) {
            $table->unique(['pharmacy_id', 'drug_id'], 'pharmacy_drug_unique');
        });
    }

    public function down(): void
    {
        Schema::table('pharmacy_drug_inventories', function (Blueprint $table) {
            $table->dropUnique('pharmacy_drug_unique');
            $table->dropColumn(['last_stock_update', 'last_expiry_check']);
        });
    }
};
