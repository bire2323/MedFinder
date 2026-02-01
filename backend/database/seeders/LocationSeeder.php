<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            // -------------------------
            // Hospital Locations
            // -------------------------
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Hospital',
                'region'           => 'Addis Ababa',
                'zone'             => 'Zone 1',
                'city'             => 'Addis Ababa',
                'sub_city'         => 'Bole',
                'kebele'           => 'Kebele 03',
                'latitude'         => 9.0054010,
                'longitude'        => 38.7636110,
                'address_type'     => 'MAIN',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Hospital',
                'region'           => 'Addis Ababa',
                'zone'             => 'Zone 2',
                'city'             => 'Addis Ababa',
                'sub_city'         => 'Yeka',
                'kebele'           => 'Kebele 11',
                'latitude'         => 9.0372100,
                'longitude'        => 38.7914500,
                'address_type'     => 'BRANCH',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],

            // -------------------------
            // Pharmacy Locations
            // -------------------------
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'region'           => 'Addis Ababa',
                'zone'             => 'Zone 3',
                'city'             => 'Addis Ababa',
                'sub_city'         => 'Arada',
                'kebele'           => 'Kebele 07',
                'latitude'         => 9.0341200,
                'longitude'        => 38.7468900,
                'address_type'     => 'MAIN',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'region'           => 'Addis Ababa',
                'zone'             => 'Zone 4',
                'city'             => 'Addis Ababa',
                'sub_city'         => 'Lideta',
                'kebele'           => 'Kebele 05',
                'latitude'         => 9.0127800,
                'longitude'        => 38.7245600,
                'address_type'     => 'BRANCH',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ];

        DB::table('locations')->insert($locations);
    }
}
