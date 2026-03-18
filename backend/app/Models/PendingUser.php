<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingUser extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'password',
        'reset_token',
        'expires_at',
    ];

    protected $dates = ['expires_at'];
}
