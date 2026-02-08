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
        'Password',
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
    public function chatSession(){
        return $this->hasMany(chatSession::class,'user_id');
    }
    
}
