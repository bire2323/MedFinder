// src/hooks/UserNotification.js
import { useEffect, useRef } from 'react';

export const useNotifications = (currentUserId, onNewMessage) => {
    useEffect(() => {
        if (!currentUserId) return;

        let cancelled = false;
        let attempts = 0;
        let channel = null;
        const MAX_ATTEMPTS = 20;

        const trySubscribe = () => {
            if (cancelled) return;
            if (!window?.Echo) {
                if (++attempts < MAX_ATTEMPTS) { setTimeout(trySubscribe, 100); }
                else { console.warn('[useNotifications] Echo unavailable. Notifications disabled.'); }
                return;
            }
            console.log(currentUserId);
            channel = window.Echo.private(`user.${currentUserId}`)
                .listen('.message.sent', (e) => {
                    onNewMessage?.(e);
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

export const useSystemNotifications = (currentUserId, onNotificationReceived) => {
    const callbackRef = useRef(onNotificationReceived);

    useEffect(() => {
        callbackRef.current = onNotificationReceived;
    }, [onNotificationReceived]);

    useEffect(() => {
        if (!currentUserId) return;

        let cancelled = false;
        let attempts = 0;
        let channel = null;
        const MAX_ATTEMPTS = 20;

        const trySubscribe = () => {
            if (cancelled) return;
            if (!window?.Echo) {
                if (++attempts < MAX_ATTEMPTS) { setTimeout(trySubscribe, 100); }
                return;
            }

            // Listen for 'notification.sent' event on 'notifications.{userId}' channel
            channel = window.Echo.private(`notifications.${currentUserId}`)
                .listen('.notification.sent', (e) => {
                    // Normalize event payloads from Reverb / Laravel notifications
                    // common shapes: { notification: {...} } or { data: {...} } or direct payload
                    const payload = e?.notification ?? e?.data ?? e;
                    try {
                        console.debug('[useSystemNotifications] Received raw event:', e);
                        console.debug('[useSystemNotifications] Normalized payload:', payload);
                    } catch (err) { /* noop */ }
                    callbackRef.current?.(payload);
                });
        };

        trySubscribe();

        return () => {
            cancelled = true;
            if (channel) {
                try { window.Echo.leave(`notifications.${currentUserId}`); } catch { /* ignore */ }
            }
        };
    }, [currentUserId, onNotificationReceived]);
};