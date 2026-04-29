<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\User;

class AuditLog extends Model
{
    use SoftDeletes;

    protected $table = 'audit_log';
    protected $fillable = [
        'user_id',
        'category',
        'event',
        'detail',
        'ip_address',
        'metadata',
        'event_status',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'metadata' => 'array',
        'event_status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
