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
        $sessions = \App\Models\ChatSession::all();
        foreach ($sessions as $session) {
            $participants = [$session->patient_id];
            
            if ($session->pharmacy_id) {
                $pharmacy = \App\Models\Pharmacy::find($session->pharmacy_id);
                if ($pharmacy && $pharmacy->pharmacy_agent_id) {
                    $participants[] = $pharmacy->pharmacy_agent_id;
                }
            } elseif ($session->hospital_id) {
                $hospital = \App\Models\Hospital::find($session->hospital_id);
                if ($hospital && $hospital->hospital_agent_id) {
                    $participants[] = $hospital->hospital_agent_id;
                }
            }
            
            $session->participants()->syncWithoutDetaching(array_unique($participants));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
