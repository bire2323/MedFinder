<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Hospital;
use App\Models\Pharmacy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HospitalPharmacySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create System Admin
        $admin = User::create([
            'name' => 'System Administrator',
            'phone' => '0900000000',
            'password' => Hash::make('admin123'),
        ]);

        // 2. SEED HOSPITALS (6 Locations in Gondar)
        $hospitalsData = [
            [
                'en' => 'University of Gondar Comprehensive Hospital',
                'am' => 'የጎንደር ዩኒቨርሲቲ ስፔሻላይዝድ ሆስፒታል',
                'phone' => '0581141232',
                'lat' => 12.6156, 'long' => 37.4523, 'sub_city' => 'Chechela'
            ],
            [
                'en' => 'Gondar General Hospital',
                'am' => 'ጎንደር አጠቃላይ ሆስፒታል',
                'phone' => '0581110245',
                'lat' => 12.6050, 'long' => 37.4600, 'sub_city' => 'Arada'
            ],
            [
                'en' => 'Ibex General Hospital',
                'am' => 'አይቤክስ አጠቃላይ ሆስፒታል',
                'phone' => '0918765432',
                'lat' => 12.5983, 'long' => 37.4502, 'sub_city' => 'Azezo'
            ],
            [
                'en' => 'Alpha Hospital',
                'am' => 'አልፋ ሆስፒታል',
                'phone' => '0921345678',
                'lat' => 12.6100, 'long' => 37.4700, 'sub_city' => 'Maraki'
            ],
            [
                'en' => 'Gondar Primary Hospital',
                'am' => 'ጎንደር አንደኛ ደረጃ ሆስፒታል',
                'phone' => '0581119988',
                'lat' => 12.6200, 'long' => 37.4400, 'sub_city' => 'Piazza'
            ],
            [
                'en' => 'Tibebe Ghion Specialized Clinic',
                'am' => 'ጥበበ ጊዮን ስፔሻላይዝድ ክሊኒክ',
                'phone' => '0933445566',
                'lat' => 12.6012, 'long' => 37.4650, 'sub_city' => 'Abina'
            ],
        ];

        foreach ($hospitalsData as $h) {
            $agent = User::create([
                'name' => $h['en'] . ' Agent',
                'phone' => '09' . rand(10000000, 99999999),
                'password' => Hash::make('agent123'),
            ]);

            Hospital::create([
                'hospital_agent_id' => $agent->id,
                'approved_by' => $admin->id,
                'hospital_name_en' => $h['en'],
                'hospital_name_am' => $h['am'],
                'hospital_ownership_type' => 'Public',
                'license_number' => 'HOSP-' . rand(1000, 9999),
                'official_license_upload' => 'licenses/hosp.pdf',
                'working_hour' => '24/7',
                'is_full_time_service' => true,
                'emergency_contact' => $h['phone'],
                'status' => 'APPROVED',
            ])->addresses()->create([
                'region_en' => 'Amhara', 'region_am' => 'አማራ',
                'zone_en' => 'Central Gondar', 'zone_am' => 'ማዕከላዊ ጎንደር',
                'sub_city_en' => $h['sub_city'], 'sub_city_am' => $h['sub_city'],
                'kebele'=>rand(1,20),
                'latitude' => $h['lat'], 'longitude' => $h['long'],
                'address_type' => 'Physical',
            ]);
        }

        // 3. SEED PHARMACIES (6 Locations in Gondar)
        $pharmaciesData = [
            ['en' => 'Goha Pharmacy', 'am' => 'ጎሃ መድኃኒት ቤት', 'sub' => 'Chechela'],
            ['en' => 'Kenema Pharmacy No.1', 'am' => 'ቀነማ መድኃኒት ቤት ቁጥር 1', 'sub' => 'Arada'],
            ['en' => 'Lion Pharmacy', 'am' => 'አንበሳ መድኃኒት ቤት', 'sub' => 'Azezo'],
            ['en' => 'Fasilo Pharmacy', 'am' => 'ፋሲሎ መድኃኒት ቤት', 'sub' => 'Maraki'],
            ['en' => 'Selam Drug Store', 'am' => 'ሰላም መድኃኒት መደብር', 'sub' => 'Piazza'],
            ['en' => 'Abyssinia Pharmacy', 'am' => 'አቢሲኒያ መድኃኒት ቤት', 'sub' => 'Gonder Ber'],
        ];

        foreach ($pharmaciesData as $p) {
            $agent = User::create([
                'name' => $p['en'] . ' Agent',
                'phone' => '09' . rand(10000000, 99999999),
                'password' => Hash::make('agent123'),
            ]);

            Pharmacy::create([
                'pharmacy_agent_id' => $agent->id,
                'approved_by' => $admin->id,
                'pharmacy_name_en' => $p['en'],
                'pharmacy_name_am' => $p['am'],
                'license_number' => 'PHAR-' . rand(1000, 9999),
                'pharmacy_license_category' => 'Retail',
                'pharmacy_license_upload' => 'licenses/pharm.pdf',
                'working_hour' => '08:00 AM - 10:00 PM',
                'status' => 'APPROVED',
            ])->addresses()->create([
                'region_en' => 'Amhara', 'region_am' => 'አማራ',
                'zone_en' => 'Central Gondar', 'zone_am' => 'ማዕከላዊ ጎንደር',
                'sub_city_en' => $p['sub'], 'sub_city_am' => $p['sub'],
                'kebele'=>rand(1,20),
                'latitude' => 12.6000 + (rand(-100, 100) / 10000), 
                'longitude' => 37.4500 + (rand(-100, 100) / 10000),
                'address_type' => 'Retail Shop',
            ]);
        }
    }
}