<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       $inventories = [
         
            [
                'pharmacy_id'        => 1,
                'drug_id'            => 2,
                'stock' => 0,
                'price' => 85,
                'about_drug_en' => "400mg",
                'about_drug_am' => "400mg",
                'expire_date' => "2026-06-30",
                'prescription_required' => true,
                
            ],
            [
                'pharmacy_id'        => 2,
                'drug_id'            => 1,
                'stock' => 12,
                'price' => 25,
                'about_drug_en' => "400mg",
                'about_drug_am' => "400mg",
                'expire_date' => "2026-08-20",
                'prescription_required' => false,
               
            ],
            [
                'pharmacy_id'        => 2,
                'drug_id'            => 3,
                'stock' => 450,
                'price' => 120,
                'about_drug_en' => "400mg",
                'about_drug_am' => "400mg",
                'expire_date' => "2026-12-15",
                'prescription_required' => true,
               
            ],
         
        ];
 
        DB::table('pharmacy_drug_inventories')->insert($inventories);
    }
}
