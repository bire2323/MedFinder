<?php

namespace App\Console\Commands;

use App\Models\PharmacyDrugInventory;
use App\Models\Notification;
use App\Events\NotificationSent;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class InventoryCheckCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for low stock and expiring items and notify pharmacies';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting inventory health check...');

        // 1. Low Stock Check
        $this->checkLowStock();

        // 2. Expiry Check
        $this->checkExpiry();

        $this->info('Inventory health check completed.');
    }

    protected function checkLowStock()
    {
        $lowStocks = PharmacyDrugInventory::whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('is_available', true)
            ->with(['pharmacy.agent', 'drug'])
            ->get();

        foreach ($lowStocks as $item) {
            $agent = $item->pharmacy->agent ?? null;
            if (!$agent) continue;

            $title = "Low Stock Alert: " . $item->drug->brand_name_en;
            $message = "Your stock for '{$item->drug->brand_name_en}' is low ({$item->stock} left). Threshold: {$item->low_stock_threshold}.";

            // Avoid duplicate notifications in the last 24 hours
            $exists = Notification::where('user_id', $agent->id)
                ->where('title', $title)
                ->where('created_at', '>', Carbon::now()->subDay())
                ->exists();

            if (!$exists) {
                $notification = Notification::create([
                    'user_id' => $agent->id,
                    'type' => 'low_stock',
                    'priority' => 'high',
                    'title' => $title,
                    'message' => $message,
                ]);

                try {
                    broadcast(new NotificationSent($notification));
                } catch (\Exception $e) {
                    $this->error("Failed to broadcast low stock notification for User {$agent->id}");
                }
            }
        }
    }

    protected function checkExpiry()
    {
        // Items expiring within 30 days
        $expiring = PharmacyDrugInventory::where('expire_date', '<=', Carbon::now()->addDays(30))
            ->where('expire_date', '>', Carbon::now())
            ->where('is_available', true)
            ->with(['pharmacy.agent', 'drug'])
            ->get();

        foreach ($expiring as $item) {
            $agent = $item->pharmacy->agent ?? null;
            if (!$agent) continue;

            $days = Carbon::now()->diffInDays(Carbon::parse($item->expire_date));
            $title = "Expiry Alert: " . $item->drug->brand_name_en;
            $message = "The drug '{$item->drug->brand_name_en}' will expire in {$days} days ({$item->expire_date}).";

            // Avoid duplicate notifications in the last 3 days
            $exists = Notification::where('user_id', $agent->id)
                ->where('title', $title)
                ->where('created_at', '>', Carbon::now()->subDays(3))
                ->exists();

            if (!$exists) {
                $notification = Notification::create([
                    'user_id' => $agent->id,
                    'type' => 'expiring',
                    'priority' => 'high',
                    'title' => $title,
                    'message' => $message,
                ]);

                try {
                    broadcast(new NotificationSent($notification));
                } catch (\Exception $e) {
                    $this->error("Failed to broadcast expiry notification for User {$agent->id}");
                }
            }
        }
    }
}

