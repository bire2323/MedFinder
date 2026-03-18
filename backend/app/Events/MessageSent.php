<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel; // 
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $message;

    public function __construct(ChatMessage $message)
    {
        $this->message = $message->load('sender:id');
    }

   
public function broadcastOn(): array
{
    $session = $this->message->session;
    
    // Explicitly identify the sender from the database record
    $senderId = $this->message->sender_id;

    // Logic: If the sender is the patient, the recipient is the agent.
    // Otherwise, the recipient is the patient.
    $recipientId = ($senderId == $session->patient_id) 
        ? $session->pharmacy_agent_id 
        : $session->patient_id;

    $channels = [
        new PresenceChannel('chat.session.' . $this->message->chat_session_id),
    ];
\Log::info("Broadcasting message {$this->message->id} to recipient: " . $recipientId);
    if ($recipientId) {
        $channels[] = new PrivateChannel('user.' . $recipientId);
    }

    return $channels;
}
    
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'chat_session_id' => $this->message->chat_session_id,
            'sender_id' => $this->message->sender_id,
            'sender' => $this->message->sender,
            'message' => $this->message->message,
            'is_read' => $this->message->is_read,
            'created_at' => $this->message->created_at->toIso8601String(),
        ];
    }
}