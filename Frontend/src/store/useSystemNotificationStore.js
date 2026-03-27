import { create } from 'zustand';

const useSystemNotificationStore = create((set, get) => ({
    notifications: [],
    latestNotification: null,

    setNotifications: (notifications) => set({ notifications }),
    
    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        latestNotification: notification
    })),

    clearLatestNotification: () => set({ latestNotification: null }),

    markAsRead: (notificationId) => set((state) => ({
        notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
    })),
}));

export default useSystemNotificationStore;
