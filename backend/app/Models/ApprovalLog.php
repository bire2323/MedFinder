<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalLog extends Model
{
    protected $fillable = [
        'facility_id',
        'facility_type',
        'action',
        'reviewed_by',
        'comment',
    ];

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function facility()
    {
        return $this->morphTo(null, 'facility_type', 'facility_id');
    }
}
