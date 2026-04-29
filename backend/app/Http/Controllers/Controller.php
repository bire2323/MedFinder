<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    protected function logAudit(Request $request, string $event, string $detail, string $eventStatus, string $category = null, array $metadata = [], ?int $userId = null)
    {
        return AuditLog::create([
            'user_id' => $userId ?? Auth::id(),
            'category' => $category,
            'event' => $event,
            'detail' => $detail,
            'ip_address' => $request->ip(),
            'metadata' => $metadata,
            'event_status' => strtoupper($eventStatus),
        ]);
    }
}
