<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drug_batches', function (Blueprint $table) {
            if (Schema::hasColumn('drug_batches', 'notes')) {
                $table->dropColumn('notes');
            }

            $table->text('description_en')->nullable()->after('lot_number');
            $table->text('description_am')->nullable()->after('description_en');
        });
    }

    public function down(): void
    {
        Schema::table('drug_batches', function (Blueprint $table) {
            if (Schema::hasColumn('drug_batches', 'description_am')) {
                $table->dropColumn('description_am');
            }
            if (Schema::hasColumn('drug_batches', 'description_en')) {
                $table->dropColumn('description_en');
            }
            if (!Schema::hasColumn('drug_batches', 'notes')) {
                $table->text('notes')->nullable()->after('status');
            }
        });
    }
};
