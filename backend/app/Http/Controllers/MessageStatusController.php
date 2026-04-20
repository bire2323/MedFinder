<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Events\MessageDelivered;
use App\Events\MessageRead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageStatusController extends Controller
{
    public function markDelivered(ChatSession $sessionId, Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
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
        $user = Auth::guard('sanctum')->user();
        $now = now();
        
        $sessionId->participants()->updateExistingPivot($user->id, [
            'last_read_at' => $now,
        ]);

        broadcast(new MessageRead($sessionId->id, $user->id, $now))->toOthers();
        
        return response()->json(['success' => true]);
    }
}