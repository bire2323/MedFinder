<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    DB::statement("ALTER TABLE hospitals ALTER COLUMN working_hour TYPE json USING working_hour::json");
    DB::statement("ALTER TABLE pharmacies ALTER COLUMN working_hour TYPE json USING working_hour::json");
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert working_hour back to string for hospitals
        Schema::table('hospitals', function (Blueprint $table) {
            $table->string('working_hour')->change();
        });

        // Revert working_hour back to string for pharmacies
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->string('working_hour')->change();
        });
    }
};
