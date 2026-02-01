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
                'manufacturer'  => 'GSK',
                'drug_category' => 'Analgesic',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Ibuprofen',
                'brand_name_en'  => 'Brufen',
                'brand_name_am'  => 'ብሩፈን',
                'manufacturer'  => 'Abbott',
                'drug_category' => 'NSAID',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Amoxicillin',
                'brand_name_en'  => 'Amoxil',
                'brand_name_am'  => 'አሞክሲሊን',
                'manufacturer'  => 'Pfizer',
                'drug_category' => 'Antibiotic',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Ciprofloxacin',
                'brand_name_en'  => 'Cipro',
                'brand_name_am'  => 'ሲፕሮ',
                'manufacturer'  => 'Bayer',
                'drug_category' => 'Antibiotic',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Metformin',
                'brand_name_en'  => 'Glucophage',
                'brand_name_am'  => 'ግሉኮፋጅ',
                'manufacturer'  => 'Merck',
                'drug_category' => 'Antidiabetic',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Amlodipine',
                'brand_name_en'  => 'Norvasc',
                'brand_name_am'  => 'ኖርቫስክ',
                'manufacturer'  => 'Pfizer',
                'drug_category' => 'Antihypertensive',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Omeprazole',
                'brand_name_en'  => 'Prilosec',
                'brand_name_am'  => 'ኦሜፕራዞል',
                'manufacturer'  => 'AstraZeneca',
                'drug_category' => 'Proton Pump Inhibitor',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Salbutamol',
                'brand_name_en'  => 'Ventolin',
                'brand_name_am'  => 'ቬንቶሊን',
                'manufacturer'  => 'GSK',
                'drug_category' => 'Bronchodilator',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Cetirizine',
                'brand_name_en'  => 'Zyrtec',
                'brand_name_am'  => 'ዚርቴክ',
                'manufacturer'  => 'UCB',
                'drug_category' => 'Antihistamine',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'generic_name'   => 'Azithromycin',
                'brand_name_en'  => 'Zithromax',
                'brand_name_am'  => 'ዚትሮማክስ',
                'manufacturer'  => 'Pfizer',
                'drug_category' => 'Antibiotic',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('drugs')->insert($drugs);
    }
}
