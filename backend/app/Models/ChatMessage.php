<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    //
    protected $table = "ChatMessage";
    protected $fillable = [
        "sessionId",
        "Message",

    ];
}
