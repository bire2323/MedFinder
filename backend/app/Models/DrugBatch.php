<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DrugBatch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'drug_id',
        'batch_number',
        'manufacture_date',
        'expiration_date',
        'manufacturer',
        'supplier_name',
        'category',
        'dosage_form',
        'certification_number',
        'lot_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'manufacture_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function pharmacyInventories(): HasMany
    {
        return $this->hasMany(PharmacyBatchInventory::class);
    }

    public function stockHistories(): HasMany
    {
        return $this->hasMany(StockHistory::class);
    }

    public function isExpired(): bool
    {
        return $this->expiration_date && $this->expiration_date->isPast();
    }

    public function isExpiringSoon(int $days = 90): bool
    {
        if (!$this->expiration_date || $this->expiration_date->isPast()) {
            return false;
        }

        return $this->expiration_date->diffInDays(now()) <= $days;
    }

    public function getTotalAvailableStock(): int
    {
        return (int) $this->pharmacyInventories()
            ->where('status', 'ACTIVE')
            ->sum('quantity_available');
    }

    public function getDaysUntilExpiration(): int
    {
        if (!$this->expiration_date) {
            return 0;
        }

        return max(0, (int) now()->diffInDays($this->expiration_date, false));
    }
}
