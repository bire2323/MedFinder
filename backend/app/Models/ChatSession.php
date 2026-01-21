<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    //
    protected $table = "ChatSession";
    protected $fillable = [
        "userId",
        "ChatContext",

    ];
}
