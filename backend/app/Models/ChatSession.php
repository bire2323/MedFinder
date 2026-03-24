<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    //
    protected $fillable = ['patient_id', 'pharmacy_id', 'hospital_id', 'status', 'language'];
    
    public function patient() { return $this->belongsTo(User::class, 'patient_id'); }
    public function pharmacy() { return $this->belongsTo(Pharmacy::class); }
    public function messages() { return $this->hasMany(ChatMessage::class, 'chat_session_id'); }
    
    public function hospital() { return $this->belongsTo(Hospital::class, "hospital_id"); }
    public function latestMessage() { return $this->hasOne(ChatMessage::class, 'chat_session_id')->latestOfMany(); }

    public function participants() {
        return $this->belongsToMany(User::class, 'chat_participants', 'chat_session_id', 'user_id')
                    ->using(ChatParticipant::class)
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }
}

