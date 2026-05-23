<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LowStockExpirationAlert extends Model
{
    protected $fillable = [
        'pharmacy_id',
        'drug_id',
        'drug_batch_id',
        'alert_type',
        'severity',
        'alert_status',
        'expiration_date',
        'notified_date',
        'alert_triggered_at',
        'resolved_at',
        'notification_message',
        'notification_metadata',
        'acknowledged_by',
    ];

    protected $casts = [
        'expiration_date' => 'datetime',
        'notified_date' => 'datetime',
        'alert_triggered_at' => 'datetime',
        'resolved_at' => 'datetime',
        'notification_metadata' => 'array',
    ];

    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function drugBatch(): BelongsTo
    {
        return $this->belongsTo(DrugBatch::class);
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
