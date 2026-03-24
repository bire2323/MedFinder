<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Policies\ChatSessionPolicy;
use Illuminate\Support\Facades\Gate;

class ChatMessageController extends Controller
{
    public function index(ChatSession $session)
    {
       Gate::authorize('view', $session);
       $user = Auth::user();

       // Find the OTHER participant's last_read_at to determine if MY messages were read
       $otherParticipant = $session->participants()
           ->where('users.id', '!=', $user->id)
           ->first();
       
       $otherLastRead = $otherParticipant ? $otherParticipant->pivot->last_read_at : null;

       // Find MY last_read_at to determine if OTHER'S messages were read by me
       $myParticipant = $session->participants()
           ->where('users.id', $user->id)
           ->first();
       $myLastRead = $myParticipant ? $myParticipant->pivot->last_read_at : null;

        $messages = $session->messages()
            ->latest()
            ->take(50)
            ->get()
            ->reverse();

        $messages->each(function($msg) use ($user, $otherLastRead, $myLastRead) {
            if ($msg->sender_id == $user->id) {
                // For my sent messages, check if the other person has read them
                $msg->is_read = $otherLastRead && $msg->created_at <= $otherLastRead;
            } else {
                // For received messages, check if I have read them
                $msg->is_read = $myLastRead && $msg->created_at <= $myLastRead;
            }
        });

        return $messages;
    }

    public function store(Request $request, ChatSession $session)
    {
       Gate::authorize('sendMessage', $session);

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $message = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_id' => Auth::id(),
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        // Also update the sender's last_seen_at
        Auth::user()->update(['last_seen_at' => now()]);

        // Eager load relationships needed for broadcasting
        $message->load(['sender:id', 'session.pharmacy', 'session.hospital']);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function markAsRead(ChatSession $session)
    {
        Gate::authorize('view', $session);

        $now = now();
        $session->participants()->updateExistingPivot(Auth::id(), [
            'last_read_at' => $now,
        ]);

        // Also update the user's global last_seen_at
        Auth::user()->update(['last_seen_at' => $now]);

        broadcast(new \App\Events\MessageRead($session->id, Auth::id(), $now))->toOthers();

        return response()->noContent();
    }
}