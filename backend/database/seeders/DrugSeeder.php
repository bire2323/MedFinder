<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DrugSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $drugs = [
            [
                'generic_name'   => 'Paracetamol',
                'brand_name_en'  => 'Panadol',
                'brand_name_am'  => 'ፓናዶል',
              
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Ibuprofen',
                'brand_name_en'  => 'Brufen',
                'brand_name_am'  => 'ብሩፈን',
              
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Amoxicillin',
                'brand_name_en'  => 'Amoxil',
                'brand_name_am'  => 'አሞክሲሊን',
              
              
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Ciprofloxacin',
                'brand_name_en'  => 'Cipro',
                'brand_name_am'  => 'ሲፕሮ',
            
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Metformin',
                'brand_name_en'  => 'Glucophage',
                'brand_name_am'  => 'ግሉኮፋጅ',
               
            
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Amlodipine',
                'brand_name_en'  => 'Norvasc',
                'brand_name_am'  => 'ኖርቫስክ',
             
               
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Omeprazole',
                'brand_name_en'  => 'Prilosec',
                'brand_name_am'  => 'ኦሜፕራዞል',
              
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Salbutamol',
                'brand_name_en'  => 'Ventolin',
                'brand_name_am'  => 'ቬንቶሊን',
              
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Cetirizine',
                'brand_name_en'  => 'Zyrtec',
                'brand_name_am'  => 'ዚርቴክ',
               
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Azithromycin',
                'brand_name_en'  => 'Zithromax',
                'brand_name_am'  => 'ዚትሮማክስ',
               
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('drugs')->insert($drugs);
    }
}
