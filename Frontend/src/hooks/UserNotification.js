// src/hooks/useNotifications.js
import { useEffect } from 'react';
import useAuthStore from '../store/UserAuthStore';

export const useNotifications = (currentUserId) => {
    useEffect(() => {
        if (!currentUserId || !window.Echo) return;
        console.log(`Subscribing to private channel: User.${currentUserId}`);
        const channel = window.Echo.private(`User.${currentUserId}`)
            .listen('.message.sent', (e) => {
                const incoming = e.message || e;
                console.log("Global Notification received:", incoming);

                // Logic to update your "Unread" state globally
                // For example, if you use Zustand:
                // useChatStore.getState().incrementUnread(incoming.chat_session_id);
            });

        return () => {
            window.Echo.leave(`User.${currentUserId}`);
        };
    }, [currentUserId]);
};