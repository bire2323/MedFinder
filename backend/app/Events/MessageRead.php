<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use App\Models\ChatMessage;

class MessageRead implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public $chatSessionId;
    public $userId;
    public $lastReadAt;

    public function __construct($chatSessionId, $userId, $lastReadAt)
    {
        $this->chatSessionId = $chatSessionId;
        $this->userId        = $userId;
        $this->lastReadAt    = $lastReadAt;
    }

    public function broadcastOn(): array
    {
        return [new PresenceChannel('chat.session.' . $this->chatSessionId)];
    }

    public function broadcastAs(): string
    {
        return 'message.read';
    }

    public function broadcastWith(): array
    {
        return [
            'chatSessionId' => $this->chatSessionId,
            'userId'        => $this->userId,
            'lastReadAt'    => $this->lastReadAt,
        ];
    }
}