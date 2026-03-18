<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Events\MessageDelivered;
use App\Events\MessageRead;
use Illuminate\Http\Request;

class MessageStatusController extends Controller
{
    public function markDelivered(ChatSession $sessionId, Request $request)
    {
        $user = auth()->user();
        
        // Mark all undelivered messages in this session as delivered
        // Only mark messages not sent by the current user
        $messages = Message::where('chat_session_id', $sessionId->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_delivered', false)
            ->get();
        
        foreach ($messages as $message) {
            $message->update([
                'is_delivered' => true,
                'delivered_at' => now()
            ]);
            
            // Broadcast delivery receipt to the sender
            broadcast(new MessageDelivered($message))->toOthers();
        }
        
        return response()->json(['success' => true, 'count' => $messages->count()]);
    }
    
    public function markRead(ChatSession $sessionId, Request $request)
    {
        $user = auth()->user();
        $request->validate(['message_id' => 'required|integer']);
        
        $messageId = $request->message_id;
        
        // Mark all messages up to this ID as read
        // Only mark messages not sent by the current user
        $messages = ChatMessage::where('chat_session_id', $sessionId->id)
            ->where('sender_id', '!=', $user->id)
            ->where('id', '<=', $messageId)
            ->where('is_read', false)
            ->get();
        
        foreach ($messages as $message) {
            $message->update([
                'is_read' => true,
                'updated_at' => now()
            ]);
            
            // Broadcast read receipt to the sender
            broadcast(new MessageRead($message))->toOthers();
        }
        
        return response()->json(['success' => true, 'count' => $messages->count()]);
    }
}