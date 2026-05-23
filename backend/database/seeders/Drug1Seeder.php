<?php

namespace Database\Seeders;

use App\Models\Drug;
use Illuminate\Database\Seeder;

class Drug1Seeder extends Seeder
{
    public function run(): void
    {
        $drugs = [
            ['generic_name' => 'Paracetamol',         'brand_name_en' => 'Panadol',          'brand_name_am' => 'ፓናዶል'],
            ['generic_name' => 'Amoxicillin',         'brand_name_en' => 'Amoxil',           'brand_name_am' => 'አሞክሲል'],
            ['generic_name' => 'Metformin HCl',       'brand_name_en' => 'Glucophage',       'brand_name_am' => 'ግሉኮፋጅ'],
            ['generic_name' => 'Salbutamol',          'brand_name_en' => 'Ventolin',         'brand_name_am' => 'ቬንቶሊን'],
            ['generic_name' => 'Omeprazole',          'brand_name_en' => 'Losec',            'brand_name_am' => 'ሎሴክ'],
            ['generic_name' => 'Cetirizine',          'brand_name_en' => 'Zyrtec',           'brand_name_am' => 'ዚርቲክ'],
            ['generic_name' => 'Diclofenac',          'brand_name_en' => 'Voltaren',         'brand_name_am' => 'ቮልታሬን'],
            ['generic_name' => 'Amlodipine',          'brand_name_en' => 'Norvasc',          'brand_name_am' => 'ኖርቫስክ'],
            ['generic_name' => 'Vitamin C',           'brand_name_en' => 'Redoxon',          'brand_name_am' => 'ረዶክሰን'],
            ['generic_name' => 'Azithromycin',        'brand_name_en' => 'Zithromax',        'brand_name_am' => 'ዚትሮማክስ'],
            ['generic_name' => 'Ibuprofen',           'brand_name_en' => 'Brufen',           'brand_name_am' => 'ብሩፌን'],
            ['generic_name' => 'Ciprofloxacin',       'brand_name_en' => 'Cipro',            'brand_name_am' => 'ሲፕሮ'],
            ['generic_name' => 'Lisinopril',          'brand_name_en' => 'Zestril',          'brand_name_am' => 'ዘስትሪል'],
            ['generic_name' => 'Clotrimazole',        'brand_name_en' => 'Canesten',         'brand_name_am' => 'ካኔስተን'],
            ['generic_name' => 'Folic Acid',          'brand_name_en' => 'Folvite',          'brand_name_am' => 'ፎልቪት'],
        ];

        foreach ($drugs as $drug) {
            Drug::create($drug);
        }
    }
}
