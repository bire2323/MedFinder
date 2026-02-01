<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacilityServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilityServices = [

            // =========================
            // Hospital Services
            // =========================
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Hospital',
                'service_id'       => 1, // General Consultation
                'is_available'     => true,
                'notes'            => 'Available during working hours',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Hospital',
                'service_id'       => 2, // Emergency Care
                'is_available'     => true,
                'notes'            => '24/7 emergency service',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Hospital',
                'service_id'       => 3, // Laboratory Testing
                'is_available'     => true,
                'notes'            => 'Results available within 24 hours',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Hospital',
                'service_id'       => 4, // Radiology
                'is_available'     => false,
                'notes'            => 'Equipment under maintenance',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],

            // =========================
            // Pharmacy Services
            // =========================
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'service_id'       => 5, // Pharmacy Dispensing
                'is_available'     => true,
                'notes'            => 'All prescription drugs available',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'service_id'       => 6, // Vaccination
                'is_available'     => false,
                'notes'            => 'Seasonal availability only',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'service_id'       => 5, // Pharmacy Dispensing
                'is_available'     => true,
                'notes'            => 'Open 7 days a week',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ];

        DB::table('facility_services')->insert($facilityServices);
    }
}
