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

   
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $message = $this->message;
        $session = $message->session;

        if (!$session) {
            \Log::error("MessageSent event: Session not found for message {$message->id}");
            return [];
        }

        $senderId = (int) $message->sender_id;
        $recipientId = null;

        // Logic:
        // 1. If sender is the patient, recipient is the agent (pharmacy or hospital).
        // 2. If sender is NOT the patient (must be an agent), recipient is the patient.
        if ($senderId === (int) $session->patient_id) {
            if ($session->pharmacy) {
           // \Log::info("Broadcasting message {2} to recipient: ");
                $recipientId = $session->pharmacy->pharmacy_agent_id;
            } elseif ($session->hospital) {
                
                $recipientId = $session->hospital->hospital_agent_id;
            }
        } else {
            \Log::info("Broadcasting message {$session->patient_id} to recipient: ");
            $recipientId = $session->patient_id;
        }

        $channels = [
            new PresenceChannel('chat.session.' . $message->chat_session_id),
        ];

        if ($recipientId) {
            \Log::info("Broadcasting message {$message->id} to recipient: {$recipientId}");
            $channels[] = new PrivateChannel('user.' . $recipientId);
        } else {
            \Log::warning("MessageSent event: Could not determine recipient for message {$message->id}. Sender: {$senderId}, Session: {$session->id}");
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
            'sender' => $this->message->load('sender:id,Name'),
            'message' => $this->message->message,
            'is_read' => $this->message->is_read,
            'created_at' => $this->message->created_at->toIso8601String(),
        ];
    }
}