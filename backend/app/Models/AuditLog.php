<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'action' => 'string',
        'detail' => 'string',
        'action_status' => 'string',
    ];
}
