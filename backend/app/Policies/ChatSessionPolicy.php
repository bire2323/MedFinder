<?php

namespace App\Policies;

use App\Models\ChatSession;
use App\Models\User;

class ChatSessionPolicy
{
    public function view(User $user, ChatSession $session): bool
    {
        return $user->id == $session->patient_id ||
               ($session->pharmacy && $user->id == $session->pharmacy->pharmacy_agent_id) ||
               ($session->hospital && $user->id == $session->hospital->hospital_agent_id);
    }

    public function sendMessage(User $user, ChatSession $session): bool
    {
        if (! $this->view($user, $session)) {
            return false;
        }
        //todo: add whether or not the user is allowed to send message to  this session

      

        return true;
    }

    public function markAsRead(User $user, ChatSession $session): bool
    {
        return $this->view($user, $session);
    }
}