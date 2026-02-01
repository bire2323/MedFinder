<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HospitalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hospitals = [
            [
                'hospital_agent_id'     => 2, // must exist in users table as agent
                'approved_by'           => 1, // admin user
               'hospital_name_en'        =>"z hospital",
               'hospital_name_am'        =>"ዝ ሆስፒታልሆስፒታል",
                'hospital_ownership_type' => 'Private',
                'license_number'        => 'HLIC1001',
                'official_license_upload' => 'licenses/green_valley_license.pdf',
                'working_hour'          => '08:00-20:00',
                'logo'                  => 'logos/green_valley_logo.png',
                'is_full_time_service'  => true,
                'emergency_contact'     => '+251911111111',
                'address_description'=>"near to the road 123",
                'status'                => 'APPROVED',
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'hospital_agent_id'     => 3,
                'approved_by'           => null, // pending approval
                  'hospital_name_en'        =>"z hospital",
               'hospital_name_am'        =>"ዝ ሆስፒታልሆስፒታል",
                'hospital_ownership_type' => 'Government',
                'license_number'        => 'HLIC1002',
                'official_license_upload' => 'licenses/city_care_license.pdf',
                'working_hour'          => '07:00-22:00',
                'logo'                  => 'logos/city_care_logo.png',
                'is_full_time_service'  => true,
                'emergency_contact'     => '+251922222222',
                'address_description'=>"near to the road 123",
                'status'                => 'PENDING',
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'hospital_agent_id'     => 4,
                'approved_by'           => 1,
                 'hospital_name_en'        =>"z hospital",
               'hospital_name_am'        =>"ዝ ሆስፒታልሆስፒታል",
                'hospital_ownership_type' => 'Private',
                'license_number'        => 'HLIC1003',
                'official_license_upload' => 'licenses/hope_hospital_license.pdf',
                'working_hour'          => '09:00-21:00',
                'logo'                  => 'logos/hope_hospital_logo.png',
                'is_full_time_service'  => false,
                'emergency_contact'     => '+251933333333',
                'address_description'=>"near to the road 123",
                'status'                => 'APPROVED',
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'hospital_agent_id'     => 5,
                'approved_by'           => 1,
                 'hospital_name_en'        =>"z hospital",
               'hospital_name_am'        =>"ዝ ሆስፒታልሆስፒታል",
                'hospital_ownership_type' => 'Government',
                'license_number'        => 'HLIC1004',
                'official_license_upload' => 'licenses/general_hospital_license.pdf',
                'working_hour'          => '24/7',
                'logo'                  => 'logos/general_hospital_logo.png',
                'is_full_time_service'  => true,
                'emergency_contact'     => '+251944444444',
                'address_description'=>"near to the road 123",
                'status'                => 'REJECTED',
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'hospital_agent_id'     => 6,
                'approved_by'           => null,
              'hospital_name_en'        =>"z hospital",
               'hospital_name_am'        =>"ዝ ሆስፒታልሆስፒታል",
                'hospital_ownership_type' => 'Private',
                'license_number'        => 'HLIC1005',
                'official_license_upload' => 'licenses/sunrise_hospital_license.pdf',
                'working_hour'          => '08:00-18:00',
                'logo'                  => 'logos/sunrise_hospital_logo.png',
                'is_full_time_service'  => false,
                'emergency_contact'     => '+251955555555',
                'address_description'=>"near to the road 123",
                'status'                => 'PENDING',
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
        ];

        DB::table('hospitals')->insert($hospitals);
    }
}
