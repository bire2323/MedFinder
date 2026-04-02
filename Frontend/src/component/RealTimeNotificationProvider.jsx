import React, { useEffect } from 'react';
import useAuthStore from '../store/UserAuthStore';
import useSystemNotificationStore from '../store/useSystemNotificationStore';
import { useSystemNotifications } from '../hooks/UserNotification';

/**
 * Global provider to handle real-time system notifications (Reverb)
 * Mount this once at the root of the app to ensure only one listener is active.
 */
export default function RealTimeNotificationProvider() {
    const { user } = useAuthStore();
    const { addNotification } = useSystemNotificationStore();

    // Single global listener for system notifications
    useSystemNotifications(user?.id, (notification) => {
        console.log('[RealTimeNotificationProvider] Received:', notification);
        addNotification(notification);
    });

    return null; // This is a logic-only provider
}
