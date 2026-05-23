<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\City;
use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Addis Ababa region
        $addisAbaba = Region::where('name_en', 'Addis Ababa')->first();
        if (!$addisAbaba) {
            return;
        }

        // Get cities
        $bole = City::where('region_id', $addisAbaba->id)->where('name_en', 'Bole')->first();
        $yeka = City::where('region_id', $addisAbaba->id)->where('name_en', 'Yeka')->first();
        $arada = City::where('region_id', $addisAbaba->id)->where('name_en', 'Arada')->first();
        $lideta = City::where('region_id', $addisAbaba->id)->where('name_en', 'Lideta')->first();

        $locations = [
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Hospital',
                'region_id'        => $addisAbaba->id,
                'city_id'          => $bole ? $bole->id : 1,
                'kebele'           => 'Kebele 03',
                'latitude'         => 9.0054010,
                'longitude'        => 38.7636110,
                'address_type'     => 'MAIN',
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Hospital',
                'region_id'        => $addisAbaba->id,
                'city_id'          => $yeka ? $yeka->id : 2,
                'kebele'           => 'Kebele 11',
                'latitude'         => 9.0372100,
                'longitude'        => 38.7914500,
                'address_type'     => 'BRANCH',
            ],
            [
                'addressable_id'   => 1,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'region_id'        => $addisAbaba->id,
                'city_id'          => $arada ? $arada->id : 4,
                'kebele'           => 'Kebele 07',
                'latitude'         => 9.0341200,
                'longitude'        => 38.7468900,
                'address_type'     => 'MAIN',
            ],
            [
                'addressable_id'   => 2,
                'addressable_type' => 'App\\Models\\Pharmacy',
                'region_id'        => $addisAbaba->id,
                'city_id'          => $lideta ? $lideta->id : 3,
                'kebele'           => 'Kebele 05',
                'latitude'         => 9.0127800,
                'longitude'        => 38.7245600,
                'address_type'     => 'BRANCH',
            ],
        ];

        foreach ($locations as $loc) {
            Location::create($loc);
        }
    }
}
