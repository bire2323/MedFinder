<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            [
                'name_en' => 'Addis Ababa',
                'name_am' => 'አዲስ አበባ',
                'code' => 'AA',
                'is_active' => true,
            ],
            [
                'name_en' => 'Oromia',
                'name_am' => 'ኦሮሚያ',
                'code' => 'OR',
                'is_active' => true,
            ],
            [
                'name_en' => 'Amhara',
                'name_am' => 'አምሐራ',
                'code' => 'AM',
                'is_active' => true,
            ],
            [
                'name_en' => 'SNNPR',
                'name_am' => 'ደቡብ ምዕራብ ሕዝቦች ህዝቦች',
                'code' => 'SW',
                'is_active' => true,
            ],
            [
                'name_en' => 'Dire Dawa',
                'name_am' => 'ድሬ ዳዋ',
                'code' => 'DD',
                'is_active' => true,
            ],
            [
                'name_en' => 'Djibouti',
                'name_am' => 'ጂቡቲ',
                'code' => 'DJ',
                'is_active' => true,
            ],
            [
                'name_en' => 'Harari',
                'name_am' => 'ሐራር',
                'code' => 'HA',
                'is_active' => true,
            ],
            [
                'name_en' => 'Somali',
                'name_am' => 'ሶማሌ',
                'code' => 'SO',
                'is_active' => true,
            ],
            [
                'name_en' => 'Afar',
                'name_am' => 'አፋር',
                'code' => 'AF',
                'is_active' => true,
            ],
            [
                'name_en' => 'Benishangul-Gumuz',
                'name_am' => 'ቤንሻንጉል-ጉምዝ',
                'code' => 'BG',
                'is_active' => true,
            ],
        ];

        foreach ($regions as $region) {
            Region::firstOrCreate(
                ['name_en' => $region['name_en']],
                $region
            );
        }
    }
}
