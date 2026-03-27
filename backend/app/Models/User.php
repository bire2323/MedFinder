<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
   use HasApiTokens, HasFactory, Notifiable, HasRoles;
protected $guard_name = 'sanctum';
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'Name',
        'Phone',
        "Email",
        'Password',
        'last_seen_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'Password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'Password' => 'hashed',
        ];
    }

    public function hospitals()
    {
        return $this->hasOne(Hospital::class, 'hospital_agent_id');
    }

    public function pharmacies()
    {
        return $this->hasOne(Pharmacy::class, 'pharmacy_agent_id');
    }
    public function chatSessions()
    {
        return $this->belongsToMany(ChatSession::class, 'chat_participants', 'user_id', 'chat_session_id')
                    ->using(ChatParticipant::class)
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }
    
}
