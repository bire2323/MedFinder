// src/hooks/UserNotification.js
import { useEffect } from 'react';

export const useNotifications = (currentUserId, onNewMessage) => {
    useEffect(() => {
        // currentUserId must be set and Echo must already be initialised.
        // Echo is created asynchronously in main.jsx — retry up to 2 s.
        if (!currentUserId) return;

        let cancelled = false;
        let attempts = 0;
        let channel = null;
        const MAX_ATTEMPTS = 20; // 20 × 100 ms = 2 s

        const trySubscribe = () => {
            if (cancelled) return;
            if (!window?.Echo) {
                if (++attempts < MAX_ATTEMPTS) { setTimeout(trySubscribe, 100); }
                else { console.warn('[useNotifications] Echo unavailable. Notifications disabled.'); }
                return;
            }

            // ⚠️  IMPORTANT: Laravel channels.php defines 'user.{id}' (lowercase u).
            // MessageSent broadcasts on PrivateChannel('user.' . $recipientId).
            // Use window.Echo.private() to subscribe to a private channel.
            //   console.log(`[useNotifications] Subscribing to private channel: user.${currentUserId}`);
            channel = window.Echo.private(`user.${currentUserId}`)
                .listen('.message.sent', (e) => {
                    const incoming = e;
                    //console.log('[useNotifications] New message:', incoming);
                    // Notify parent component / global state
                    onNewMessage?.(incoming);
                });
        };

        trySubscribe();

        return () => {
            cancelled = true;
            if (channel) {
                try { window.Echo.leave(`user.${currentUserId}`); } catch { /* ignore */ }
            }
        };
    }, [currentUserId, onNewMessage]);
};