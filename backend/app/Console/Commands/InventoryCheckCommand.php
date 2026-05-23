<?php

namespace App\Console\Commands;

use App\Events\NotificationSent;
use App\Models\Notification;
use App\Models\Pharmacy;
use App\Models\PharmacyDrugInventory;
use App\Repositories\InventoryRepository;
use App\Services\StockAlertService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class InventoryCheckCommand extends Command
{
    protected $signature = 'inventory:check';

    protected $description = 'Check for low stock and expiring batches and notify pharmacies';

    public function handle(InventoryRepository $inventory, StockAlertService $alerts): void
    {
        $this->info('Starting batch-aware inventory health check...');

        Pharmacy::where('status', 'APPROVED')->chunk(50, function ($pharmacies) use ($inventory, $alerts) {
            foreach ($pharmacies as $pharmacy) {
                $alerts->checkAndCreateAlerts($pharmacy);
                $this->notifyLowStock($pharmacy, $inventory);
                $this->notifyExpiring($pharmacy, $inventory);
            }
        });

        $this->info('Inventory health check completed.');
    }

    protected function notifyLowStock(Pharmacy $pharmacy, InventoryRepository $inventory): void
    {
        $lowStocks = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('is_available', true)
            ->with(['pharmacy.agent', 'drug'])
            ->get();

        foreach ($lowStocks as $item) {
            $agent = $item->pharmacy->agent ?? null;
            if (!$agent) {
                continue;
            }

            $title = 'Low Stock Alert: ' . $item->drug->brand_name_en;
            $message = "Stock for '{$item->drug->brand_name_en}' is low ({$item->stock} left). Threshold: {$item->low_stock_threshold}.";

            $this->sendNotification($agent->id, 'low_stock', $title, $message, Carbon::now()->subDay());
        }

        foreach ($inventory->getLowStockBatches($pharmacy) as $batch) {
            $agent = $pharmacy->agent ?? null;
            if (!$agent || !$batch->drugBatch?->drug) {
                continue;
            }

            $drugName = $batch->drugBatch->drug->brand_name_en;
            $title = "Low Stock (Batch): {$drugName}";
            $message = "Batch {$batch->drugBatch->batch_number} has only {$batch->quantity_available} units left.";

            $this->sendNotification($agent->id, 'low_stock', $title, $message, Carbon::now()->subDay());
        }
    }

    protected function notifyExpiring(Pharmacy $pharmacy, InventoryRepository $inventory): void
    {
        foreach ($inventory->getExpiringBatches($pharmacy, 30) as $batch) {
            $agent = $pharmacy->agent ?? null;
            if (!$agent || !$batch->drugBatch?->drug) {
                continue;
            }

            $days = $batch->drugBatch->getDaysUntilExpiration();
            $drugName = $batch->drugBatch->drug->brand_name_en;
            $title = "Expiry Alert: {$drugName}";
            $message = "Batch {$batch->drugBatch->batch_number} expires in {$days} days ({$batch->drugBatch->expiration_date->format('Y-m-d')}).";

            $this->sendNotification($agent->id, 'expiring', $title, $message, Carbon::now()->subDays(3));
        }
    }

    protected function sendNotification(int $userId, string $type, string $title, string $message, Carbon $since): void
    {
        $exists = Notification::where('user_id', $userId)
            ->where('title', $title)
            ->where('created_at', '>', $since)
            ->exists();

        if ($exists) {
            return;
        }

        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'priority' => 'high',
            'title' => $title,
            'message' => $message,
        ]);

        try {
            broadcast(new NotificationSent($notification));
        } catch (\Exception $e) {
            $this->error("Failed to broadcast notification for User {$userId}");
        }
    }
}
