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

        return $session->messages()
            //->with('sender:id,name,role')
            ->latest()
            ->take(50)
            ->get()
            ->reverse();
           
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

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('sender:id'));
    }

    public function markAsRead(ChatSession $session)
    {
        $this->authorize('markAsRead', $session);

        $session->messages()
            ->where('sender_id', '!=', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Optional: broadcast 'messages.read' event

        return response()->noContent();
    }
}