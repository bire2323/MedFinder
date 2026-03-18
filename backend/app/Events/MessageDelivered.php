<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use App\Models\ChatMessage;

class MessageDelivered implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public $messageId;
    public $chatSessionId;
    public $deliveredAt;

    public function __construct(ChatMessage $message)
    {
        $this->messageId = $message->id;
        $this->chatSessionId = $message->chat_session_id;
        $this->deliveredAt = now();
    }

    public function broadcastOn()
    {
        return new Channel('chat.session.' . $this->chatSessionId);
    }

    public function broadcastAs()
    {
        return 'message.delivered';
    }
}