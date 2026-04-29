// import { create } from 'zustand';

// const useSystemNotificationStore = create((set, get) => ({
//     notifications: [],
//     latestNotification: null,

//     setNotifications: (notifications) => set({ notifications }),

//     addNotification: (notification) => set((state) => ({
//         notifications: [notification, ...state.notifications],
//         latestNotification: notification
//     })),

//     clearLatestNotification: () => set({ latestNotification: null }),

//     markAsRead: (notificationId) => set((state) => ({
//         notifications: state.notifications.map(n => 
//             n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
//         )
//     })),
// }));

// export default useSystemNotificationStore;

import { create } from 'zustand';

const useSystemNotificationStore = create((set, get) => ({
    notifications: [],
    latestNotification: null,

    // For initial loading from API (used in AdminDashboard & NotificationDropdown)
    setNotifications: (newNotifications) => {
        if (!Array.isArray(newNotifications)) return;
        set({ notifications: newNotifications });
    },

    // For real-time notifications (used by RealTimeNotificationProvider)
    addNotification: (notification) => {
        if (!notification || !notification.id) return;

        const state = get();

        // Prevent duplicate by ID
        const exists = state.notifications.some(n => n.id === notification.id);
        if (exists) return;

        set((state) => ({
            notifications: [notification, ...state.notifications],   // newest first
            latestNotification: notification
        }));
    },

    clearLatestNotification: () => set({ latestNotification: null }),

    markAsRead: (notificationId) => set((state) => ({
        notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({
            ...n,
            read_at: new Date().toISOString()
        }))
    })),

    clearAllNotifications: () => set({
        notifications: [],
        latestNotification: null
    }),
}));

export default useSystemNotificationStore;