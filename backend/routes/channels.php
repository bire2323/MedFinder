<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatSession;

// ─── Presence Channel: chat.session.{sessionId} ───────────────────────────
// Both the patient and the pharmacy agent join this channel.
// Used for: MessageSent (presence channel), MessageRead (presence channel),
//           and typing whispers.
// Authorization: the requesting user must be either the patient or the agent
//                for the given session.
Broadcast::channel('chat.session.{sessionId}', function ($user, $sessionId) {
    $session = ChatSession::find($sessionId);
    if (!$session) return false;

    $allowed = app(\App\Policies\ChatSessionPolicy::class)->view($user, $session);
    if (!$allowed) return false;

    // Return user data that will be available in the .here() / .joining() /
    // .leaving() callbacks on the frontend.  Use lowercase 'name' — the
    // standard Laravel User model column is 'name', not 'Name'.
    return ['id' => $user->id, 'name' => $user->Name];
}, ['guards' => ['sanctum']]);

// ─── Private Channel: user.{id} ───────────────────────────────────────────
// Used to deliver MessageSent notifications to the RECIPIENT's personal
// channel (so they receive a notification even when not in the session view).
// Must match exactly: PrivateChannel('user.' . $recipientId) in MessageSent.
Broadcast::channel('user.{id}', function ($user, $id) {
    \Log::info("Event fired! {$id}");
    \Log::info("User ID: {$user->id}");

    return (int) $user->id === (int) $id;
}, ['guards' => ['sanctum']]);