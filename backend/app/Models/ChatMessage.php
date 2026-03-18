<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    //
   protected $fillable = ['chat_session_id', 'sender_id', 'message', 'is_read'];
    
    
   
    

    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'chat_session_id');
    }
      public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
