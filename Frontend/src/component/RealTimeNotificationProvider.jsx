import React, { useEffect } from 'react';
import useAuthStore from '../store/UserAuthStore';
import useSystemNotificationStore from '../store/useSystemNotificationStore';
import { useSystemNotifications, useNotifications } from '../hooks/UserNotification';
import useChatNotificationStore from '../store/useChatNotificationStore';

/**
 * Global provider to handle real-time system notifications (Reverb)
 * Mount this once at the root of the app to ensure only one listener is active.
 */
export default function RealTimeNotificationProvider() {
    const { user } = useAuthStore();
    const { addNotification } = useSystemNotificationStore();
    const { handleIncomingMessage } = useChatNotificationStore();
    // // Single global listener for system notifications
    // useSystemNotifications(user?.id, (notification) => {
    //     // console.log('[RealTimeNotificationProvider] Received:', notification);
    //     addNotification(notification);
    // });
    useSystemNotifications(user?.id, (notification) => {
        console.log('[RealTime] Received notification:', notification);

        if (notification?.id) {
            addNotification(notification);     // This will update latestNotification
        }
    });
    useNotifications(user?.id, (incoming) => {
        handleIncomingMessage({
            message: incoming.message,
            senderName: incoming.sender.sender?.Name || `User ${incoming.sender_id}`,
            sessionId: incoming.chat_session_id,
            fullMessage: incoming
        });
    });

    return null;
}
