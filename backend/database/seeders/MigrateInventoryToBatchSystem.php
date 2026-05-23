<?php

namespace Database\Seeders;

use App\Models\DrugBatch;
use App\Models\PharmacyBatchInventory;
use App\Models\PharmacyDrugInventory;
use App\Repositories\InventoryRepository;
use Illuminate\Database\Seeder;

class MigrateInventoryToBatchSystem extends Seeder
{
    public function run(): void
    {
        $repository = app(InventoryRepository::class);
        $inventories = PharmacyDrugInventory::with(['drug', 'pharmacy'])->get();

        foreach ($inventories as $inventory) {
            if ($inventory->stock <= 0 && !$inventory->batch_number && !$inventory->expire_date) {
                continue;
            }

            $batchNumber = $inventory->batch_number ?: 'LEGACY_' . $inventory->id;

            $batch = DrugBatch::firstOrCreate(
                [
                    'drug_id' => $inventory->drug_id,
                    'batch_number' => $batchNumber,
                    'manufacture_date' => null,
                ],
                [
                    'expiration_date' => $inventory->expire_date ?? now()->addYear(),
                    'manufacturer' => $inventory->manufacturer,
                    'category' => $inventory->category,
                    'dosage_form' => $inventory->dosage_form,
                    'status' => $inventory->status === 'AVAILABLE' ? 'ACTIVE' : 'DISCONTINUED',
                ]
            );

            $existingBatchInventory = PharmacyBatchInventory::where('pharmacy_id', $inventory->pharmacy_id)
                ->where('drug_batch_id', $batch->id)
                ->first();

            if (!$existingBatchInventory) {
                PharmacyBatchInventory::create([
                    'pharmacy_id' => $inventory->pharmacy_id,
                    'drug_batch_id' => $batch->id,
                    'quantity_received' => $inventory->stock,
                    'quantity_available' => $inventory->stock,
                    'quantity_dispensed' => 0,
                    'unit_cost_price' => $inventory->cost_price,
                    'unit_selling_price' => $inventory->price,
                    'received_at' => $inventory->created_at,
                    'fifo_order' => 1,
                    'status' => 'ACTIVE',
                ]);
            }

            if ($inventory->pharmacy && $inventory->drug) {
                $repository->syncSummaryInventory($inventory->pharmacy, $inventory->drug);
            }

            $this->command?->info("Migrated: {$inventory->drug?->generic_name} @ pharmacy {$inventory->pharmacy_id}");
        }

        $this->command?->info('Batch inventory migration complete.');
    }
}
