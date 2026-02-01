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
                'drug_id'            => 1,
                'quantity_available' => 150,
                'unit_cost'          => 5.50,
                'selling_price'      => 7.00,
                'status'             => 'AVAILABLE',
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'pharmacy_id'        => 1,
                'drug_id'            => 2,
                'quantity_available' => 0,
                'unit_cost'          => 8.00,
                'selling_price'      => 10.00,
                'status'             => 'OUT_OF_STOCK',
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'pharmacy_id'        => 2,
                'drug_id'            => 1,
                'quantity_available' => 80,
                'unit_cost'          => 5.40,
                'selling_price'      => 6.80,
                'status'             => 'AVAILABLE',
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'pharmacy_id'        => 2,
                'drug_id'            => 3,
                'quantity_available' => 30,
                'unit_cost'          => 12.00,
                'selling_price'      => 15.00,
                'status'             => 'AVAILABLE',
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'pharmacy_id'        => 3,
                'drug_id'            => 4,
                'quantity_available' => 5,
                'unit_cost'          => 20.00,
                'selling_price'      => 25.00,
                'status'             => 'DISCONTINUED',
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
        ];

        DB::table('pharmacy_drug_inventories')->insert($inventories);
    }
}
