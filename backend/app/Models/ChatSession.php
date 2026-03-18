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
    
    public function hospital() { return $this->belongsTO(Hospital::class, "hospital_id"); }
   
}
