<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ChatParticipant extends Pivot
{
    protected $table = 'chat_participants';
    
    protected $fillable = [
        'chat_session_id',
        'user_id',
        'last_read_at',
    ];

    protected $casts = [
        'last_read_at' => 'datetime',
    ];
}
