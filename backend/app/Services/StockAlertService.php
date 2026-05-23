<?php

namespace App\Services;

use App\Models\LowStockExpirationAlert;
use App\Models\Pharmacy;
use App\Models\PharmacyBatchInventory;
use App\Repositories\InventoryRepository;

class StockAlertService
{
    public function __construct(
        protected InventoryRepository $inventory
    ) {}

    public function checkAndCreateAlerts(Pharmacy $pharmacy): void
    {
        $this->checkExpiringBatches($pharmacy);
        $this->checkLowStock($pharmacy);
        $this->checkExpiredBatches($pharmacy);
    }

    /**
     * Run after any batch quantity change — creates or resolves per-batch low stock alerts.
     */
    public function evaluateBatchLowStock(PharmacyBatchInventory $batch): void
    {
        $batch->loadMissing('drugBatch');
        if (!$batch->drugBatch) {
            return;
        }

        $pharmacy = Pharmacy::find($batch->pharmacy_id);
        if (!$pharmacy) {
            return;
        }

        $threshold = $batch->resolveLowStockThreshold();
        $available = $batch->quantity_available;
        $batchNumber = $batch->drugBatch->batch_number;

        if ($available <= $threshold) {
            $severity = $available === 0 ? 'CRITICAL' : ($available <= max(1, (int) floor($threshold / 2)) ? 'HIGH' : 'MEDIUM');

            $this->createAlertIfMissing(
                $pharmacy,
                $batch,
                'LOW_STOCK',
                $severity,
                "Low stock (batch {$batchNumber}): {$available} units left (alert at ≤ {$threshold})."
            );
        } else {
            $this->resolveAlertsForBatch($batch, ['LOW_STOCK', 'CRITICAL_LOW']);
        }
    }

    private function checkExpiringBatches(Pharmacy $pharmacy): void
    {
        $expiringBatches = PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->where('status', 'ACTIVE')
            ->where('quantity_available', '>', 0)
            ->whereHas('drugBatch', function ($query) {
                $query->where('expiration_date', '<=', now()->addDays(30))
                    ->where('expiration_date', '>', now());
            })
            ->with('drugBatch')
            ->get();

        foreach ($expiringBatches as $batch) {
            $daysUntilExpiry = $batch->drugBatch->getDaysUntilExpiration();
            $alertType = $daysUntilExpiry <= 7 ? 'NEAR_EXPIRY' : 'EXPIRING_SOON';
            $severity = $daysUntilExpiry <= 7 ? 'HIGH' : 'MEDIUM';

            $this->createAlertIfMissing(
                $pharmacy,
                $batch,
                $alertType,
                $severity,
                "Drug batch {$batch->drugBatch->batch_number} expires on {$batch->drugBatch->expiration_date->format('Y-m-d')}"
            );
        }
    }

    private function checkLowStock(Pharmacy $pharmacy): void
    {
        foreach ($this->inventory->getLowStockBatches($pharmacy) as $batch) {
            $this->evaluateBatchLowStock($batch);
        }
    }

    private function checkExpiredBatches(Pharmacy $pharmacy): void
    {
        $expiredBatches = PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->where('status', 'ACTIVE')
            ->where('quantity_available', '>', 0)
            ->whereHas('drugBatch', fn ($q) => $q->where('expiration_date', '<', now()->toDateString()))
            ->with('drugBatch')
            ->get();

        foreach ($expiredBatches as $batch) {
            $batch->update(['status' => 'EXPIRED']);

            LowStockExpirationAlert::create([
                'pharmacy_id' => $pharmacy->id,
                'drug_id' => $batch->drugBatch->drug_id,
                'drug_batch_id' => $batch->drug_batch_id,
                'alert_type' => 'EXPIRED',
                'severity' => 'CRITICAL',
                'alert_status' => 'PENDING',
                'alert_triggered_at' => now(),
                'expiration_date' => $batch->drugBatch->expiration_date,
                'notified_date' => now(),
                'notification_message' => "EXPIRED: Batch {$batch->drugBatch->batch_number} expired on {$batch->drugBatch->expiration_date->format('Y-m-d')}. {$batch->quantity_available} units must be removed.",
            ]);
        }
    }

    private function resolveAlertsForBatch(PharmacyBatchInventory $batch, array $types): void
    {
        LowStockExpirationAlert::where('pharmacy_id', $batch->pharmacy_id)
            ->where('drug_batch_id', $batch->drug_batch_id)
            ->whereIn('alert_type', $types)
            ->whereIn('alert_status', ['PENDING', 'NOTIFIED', 'ACKNOWLEDGED'])
            ->update([
                'alert_status' => 'RESOLVED',
                'resolved_at' => now(),
            ]);
    }

    private function createAlertIfMissing(
        Pharmacy $pharmacy,
        PharmacyBatchInventory $batch,
        string $alertType,
        string $severity,
        string $message
    ): void {
        $exists = LowStockExpirationAlert::where('pharmacy_id', $pharmacy->id)
            ->where('drug_batch_id', $batch->drug_batch_id)
            ->where('alert_type', $alertType)
            ->where('alert_status', '!=', 'RESOLVED')
            ->exists();

        if ($exists) {
            return;
        }

        LowStockExpirationAlert::create([
            'pharmacy_id' => $pharmacy->id,
            'drug_id' => $batch->drugBatch->drug_id,
            'drug_batch_id' => $batch->drug_batch_id,
            'alert_type' => $alertType,
            'severity' => $severity,
            'alert_status' => 'PENDING',
            'alert_triggered_at' => now(),
            'expiration_date' => $batch->drugBatch->expiration_date,
            'notified_date' => now(),
            'notification_message' => $message,
        ]);
    }
}
