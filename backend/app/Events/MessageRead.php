<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use App\Models\ChatMessage;

class MessageRead implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public $messageId;
    public $chatSessionId;
    public $senderId;

    public function __construct(ChatMessage $message)
    {
        $this->messageId = $message->id;
        $this->chatSessionId = $message->chat_session_id;
        $this->senderId = $message->sender_id;
    }

    public function broadcastOn()
    {
        return new Channel('chat.session.' . $this->chatSessionId);
    }

    public function broadcastAs()
    {
        return 'message.read';
    }
}