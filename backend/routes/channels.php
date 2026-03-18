<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatSession;

Broadcast::channel('chat.session.{sessionId}', function ($user, $sessionId) {
    $session = ChatSession::findOrFail($sessionId);

    return app(\App\Policies\ChatSessionPolicy::class)->view($user, $session)
        ? ['id' => $user->id, 'name' => $user->Name]
        : false;
});
// Simplify the name
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
}, ['guards' => ['sanctum']]);