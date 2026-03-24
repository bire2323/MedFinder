import { create } from 'zustand';

const useChatNotificationStore = create((set, get) => ({
  sessions: [],
  activeSessionId: null,
  latestMessage: null,
  targetSessionToOpen: null,

  getUnreadCount: () => {
    return get().sessions.reduce((sum, s) => sum + (s?.unread_count || 0), 0);
  },

  setSessions: (sessions) => set({ sessions }),

  setActiveSessionId: (id) => {
    set({ activeSessionId: id });
    if (id) {
      get().updateSession(id, { unread_count: 0 });
    }
  },

  updateSession: (sessionId, data) => set((state) => ({
    sessions: state.sessions.map((s) =>
      String(s.id) === String(sessionId) ? { ...s, ...data } : s
    )
  })),

  handleIncomingMessage: (messageData) => {
    const { sessionId, message, senderName, fullMessage } = messageData;
    const { activeSessionId } = get();

    set((state) => {
      const isNotOpen = String(activeSessionId) !== String(sessionId);
      const exists = state.sessions.find(s => String(s.id) === String(sessionId));

      let updatedSessions = state.sessions;
      if (exists) {
        updatedSessions = state.sessions.map(s => {
          if (String(s.id) === String(sessionId)) {
            return {
              ...s,
              unread_count: isNotOpen ? (s.unread_count || 0) + 1 : 0,
              last_message: message || s.last_message,
            };
          }
          return s;
        });
      } else {
        // Provide a minimal fallback if session not fetched yet
        // Better to let a component fetch it instead soon
      }

      return {
        sessions: updatedSessions,
        latestMessage: { sessionId, message, senderName, fullMessage, timestamp: Date.now() }
      };
    });
  },

  loadSessions: async () => {
    try {
      const { apiFetch } = await import('../api/client');
      const data = await apiFetch('/api/chat/sessions');
      const fetchedSessions = Array.isArray(data) ? data : Object.values(data || {});
      set({ sessions: fetchedSessions });
    } catch (e) {
      console.error('Error fetching global chat sessions:', e);
    }
  },

  clearLatestMessage: () => set({ latestMessage: null }),
  setTargetSessionToOpen: (id) => set({ targetSessionToOpen: id }),
}));

export default useChatNotificationStore;
