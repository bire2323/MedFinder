<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example pharmacy data
        $pharmacies = [
            [
                'pharmacy_agent_id' => 2, // ID of a pharmacy agent in users table
                'approved_by'       => 1, // ID of admin user
                'pharmacy_name_en'     => 'HealthPlus Pharmacy',
                'pharmacy_name_am'     => 'ፍፍፍፍ Pharmacy',
                'license_number'    => 'LIC123456',
                'pharmacy_license_category' => 'Retail',
                'pharmacy_license_upload'   => 'licenses/healthplus_license.pdf',
                'working_hour'      => '08:00-20:00',
                'logo'              => 'logos/healthplus_logo.png',
                'status'            => 'APPROVED',
                'address_description'=>"near to the road 123",
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'pharmacy_agent_id' => 3,
                'approved_by'       => null, // still pending approval
                'pharmacy_name_en'     => 'abrham Pharmacy',
                'pharmacy_name_am'     => 'አብርሃም Pharmacy',
                'license_number'    => 'LIC654321',
                'pharmacy_license_category' => 'Retail',
                'pharmacy_license_upload'   => 'licenses/medicare_license.pdf',
                'working_hour'      => '09:00-19:00',
                'logo'              => 'logos/medicare_logo.png',
                'status'            => 'PENDING',
                'address_description'=>"near to the road 123",
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'pharmacy_agent_id' => 4,
                'approved_by'       => 1,
                'pharmacy_name_en'     => 'CityCare Pharmacy',
                'pharmacy_name_am'     => 'ከተማ Pharmacy',
                'license_number'    => 'LIC987654',
                'pharmacy_license_category' => 'Wholesale',
                'pharmacy_license_upload'   => 'licenses/citycare_license.pdf',
                'working_hour'      => '07:00-21:00',
                'logo'              => 'logos/citycare_logo.png',
                'status'            => 'REJECTED',
                'address_description'=>"near to the road 123",
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        DB::table('pharmacies')->insert($pharmacies);
    }
}
