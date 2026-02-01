<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    //
    
    protected $fillable = [
        "user_id",
        "chat_context",

    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'session_id');
    }
}
