<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Region;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            // Addis Ababa
            [
                'region_name_en' => 'Addis Ababa',
                'name_en' => 'Bole',
                'name_am' => 'ቦሌ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Addis Ababa',
                'name_en' => 'Yeka',
                'name_am' => 'የካ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Addis Ababa',
                'name_en' => 'Lideta',
                'name_am' => 'ልደታ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Addis Ababa',
                'name_en' => 'Arada',
                'name_am' => 'አራዳ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Addis Ababa',
                'name_en' => 'Nifas Silk-Lafto',
                'name_am' => 'ንፋስ ሲልክ-ላፍቶ',
                'is_active' => true,
            ],

            // Oromia
            [
                'region_name_en' => 'Oromia',
                'name_en' => 'Adama',
                'name_am' => 'አዳማ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Oromia',
                'name_en' => 'Adis Alem',
                'name_am' => 'አዲስ አለም',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Oromia',
                'name_en' => 'Dukem',
                'name_am' => 'ዱከም',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Oromia',
                'name_en' => 'Debre Birhan',
                'name_am' => 'ደብረ ብርሃን',
                'is_active' => true,
            ],

            // Amhara
            [
                'region_name_en' => 'Amhara',
                'name_en' => 'Bahir Dar',
                'name_am' => 'ባህር ዳር',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Amhara',
                'name_en' => 'Gonder',
                'name_am' => 'ጎንደር',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Amhara',
                'name_en' => 'Dessie',
                'name_am' => 'ደሴ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'Amhara',
                'name_en' => 'Mekelle',
                'name_am' => 'መቀሌ',
                'is_active' => true,
            ],

            // SNNPR
            [
                'region_name_en' => 'SNNPR',
                'name_en' => 'Hawassa',
                'name_am' => 'ሐዋሳ',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'SNNPR',
                'name_en' => 'Arba Minch',
                'name_am' => 'አርባ ምንች',
                'is_active' => true,
            ],
            [
                'region_name_en' => 'SNNPR',
                'name_en' => 'Jima',
                'name_am' => 'ጂማ',
                'is_active' => true,
            ],

            // Dire Dawa
            [
                'region_name_en' => 'Dire Dawa',
                'name_en' => 'Dire Dawa City',
                'name_am' => 'ድሬ ዳዋ ከተማ',
                'is_active' => true,
            ],

            // Harari
            [
                'region_name_en' => 'Harari',
                'name_en' => 'Harar',
                'name_am' => 'ሐረር',
                'is_active' => true,
            ],

            // Somali
            [
                'region_name_en' => 'Somali',
                'name_en' => 'Jijiga',
                'name_am' => 'ጂጂጋ',
                'is_active' => true,
            ],
        ];

        foreach ($cities as $cityData) {
            $regionNameEn = $cityData['region_name_en'];
            unset($cityData['region_name_en']);

            $region = Region::where('name_en', $regionNameEn)->first();

            if ($region) {
                City::firstOrCreate(
                    ['region_id' => $region->id, 'name_en' => $cityData['name_en']],
                    ['region_id' => $region->id, ...$cityData]
                );
            }
        }
    }
}
