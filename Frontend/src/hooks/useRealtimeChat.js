import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeMessage, dedupeMessages } from "../utils/chatUtils";
import * as chatApi from "../api/chatApi";
import useChatNotificationStore from "../store/useChatNotificationStore";

// Hook: useRealtimeChat
// Manages messages state for a single chat session and wires up Laravel Echo.
export default function useRealtimeChat(sessionId, options = {}) {
  const { currentUserId } = options;

  // Stable callback refs — prevent the options object from causing the
  // subscription useEffect to re-run on every render (infinite loop).
  const onMessageRef = useRef(options.onMessage);
  const onReadRef    = useRef(options.onRead);
  const onHereRef    = useRef(options.onHere);
  const onJoinRef    = useRef(options.onJoin);
  const onLeaveRef   = useRef(options.onLeave);
  useEffect(() => { onMessageRef.current = options.onMessage; }, [options.onMessage]);
  useEffect(() => { onReadRef.current    = options.onRead;    }, [options.onRead]);
  useEffect(() => { onHereRef.current    = options.onHere;   }, [options.onHere]);
  useEffect(() => { onJoinRef.current    = options.onJoin;   }, [options.onJoin]);
  useEffect(() => { onLeaveRef.current   = options.onLeave;  }, [options.onLeave]);

  const { latestMessage } = useChatNotificationStore();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [whoIsTyping, setWhoIsTyping] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (latestMessage && String(latestMessage.sessionId) === String(sessionId) && latestMessage.fullMessage) {
      const incoming = normalizeMessage(latestMessage.fullMessage);
      if (incoming && mounted.current) {
          setMessages((prev) => dedupeMessages([...prev, incoming]));
      }
    }
  }, [latestMessage, sessionId]);

  // channelRef stores the channel NAME string (not the object) to guard
  // against duplicate subscriptions when sessionId does not change.
  const channelRef    = useRef(null);
  // echoChannelRef stores the actual Echo channel object so sendTyping can
  // whisper on it without calling Echo.join() a second time.
  const echoChannelRef = useRef(null);
  const mounted       = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (channelRef.current && window?.Echo) {
        try { window.Echo.leave(channelRef.current); } catch { /* ignore */ }
        channelRef.current    = null;
        echoChannelRef.current = null;
      }
    };
  }, []);

  const fetchMessages = useCallback(async (sid) => {
    if (!sid) return [];
    const data = await chatApi.fetchMessages(sid);
    const arr = Array.isArray(data) ? data : Object.values(data || {});
    const normalized = arr.map(normalizeMessage).filter(Boolean);
    normalized.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (mounted.current) setMessages(normalized);
    return normalized;
  }, []);

  const markAsRead = useCallback(async (sid, messageId) => {
    if (!sid || !messageId) return;
    try { await chatApi.markMessagesRead(sid, messageId); } catch { /* non-fatal */ }
  }, []);

  const sendMessage = useCallback(async (sid, text) => {
    if (!sid || !text) throw new Error("missing args");
    const res = await chatApi.sendMessage(sid, text);
    const msg = normalizeMessage(res || {});
    if (msg && mounted.current) {
      setMessages((prev) => dedupeMessages([...prev, msg]));
    }
    return msg;
  }, []);

  // sendTyping: whisper on the EXISTING joined channel, never re-join.
  const sendTyping = useCallback((payload = { typing: true, name: "Someone" }) => {
    if (!echoChannelRef.current) return;
    try { echoChannelRef.current.whisper("typing", payload); } catch { /* ignore */ }
  }, []);

  // ─── Subscribe to Echo real-time events ──────────────────────────────────
  // Dep array: only [sessionId] — the options callbacks are accessed via refs
  // so they never cause extra re-subscriptions.
  useEffect(() => {
    if (!sessionId) return;

    // Echo is created asynchronously in main.jsx; wait for it to be ready.
    let cancelled = false;
    let attempts  = 0;
    const MAX_ATTEMPTS = 20;   // 2 s total

    const trySubscribe = () => {
      if (cancelled) return;
      if (!window?.Echo) {
        if (++attempts < MAX_ATTEMPTS) {
          setTimeout(trySubscribe, 100);
        } else {
          console.warn("[useRealtimeChat] Echo not available after waiting. Real-time disabled.");
        }
        return;
      }

      const channelName = `chat.session.${sessionId}`;

      // Avoid duplicate subscribe
      if (channelRef.current === channelName) return;

      // Unsubscribe previous channel
      if (channelRef.current) {
        try { window.Echo.leave(channelRef.current); } catch { /* ignore */ }
        channelRef.current     = null;
        echoChannelRef.current = null;
      }

      channelRef.current = channelName;

      const channel = window.Echo.join(channelName)
        .here((users) => { 
          if (mounted.current) setOnlineUsers(users.map(u => u.id));
          onHereRef.current?.(users); 
        })
        .joining((u)  => { 
          if (mounted.current) setOnlineUsers(prev => [...new Set([...prev, u.id])]);
          onJoinRef.current?.(u);    
        })
        .leaving((u)  => { 
          if (mounted.current) setOnlineUsers(prev => prev.filter(id => id !== u.id));
          onLeaveRef.current?.(u);   
        })
        .listen(".message.sent", (e) => {
          const incoming = normalizeMessage(e?.message ?? e ?? {});
          if (!incoming) return;
          if (mounted.current) setMessages((prev) => dedupeMessages([...prev, incoming]));
          onMessageRef.current?.(incoming);
        })
        .listen(".message.read", (e) => {
          const { userId, lastReadAt } = e;
          if (!userId || !lastReadAt) return;

          // If someone else read the session, update all my messages' status
          if (String(userId) !== String(currentUserId)) {
            if (mounted.current) {
              setMessages((prev) =>
                prev.map((m) => {
                   // If message was sent before or at the lastReadAt time, mark as read
                   const msgTime = new Date(m.created_at);
                   const readTime = new Date(lastReadAt);
                   if (msgTime <= readTime) {
                     return { ...m, is_read: true };
                   }
                   return m;
                })
              );
            }
          }
          onReadRef.current?.(lastReadAt);
        })
        .listenForWhisper("typing", (data) => {
          const typing = !!data?.typing;
          if (mounted.current) {
            setIsTyping(typing);
            setWhoIsTyping(typing ? data?.name || null : null);
          }
          if (!typing) return;
          setTimeout(() => {
            if (mounted.current) { setIsTyping(false); setWhoIsTyping(null); }
          }, 2500);
        });

      // Save the channel object so sendTyping can whisper without re-joining
      echoChannelRef.current = channel;
    };

    trySubscribe();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        try { window.Echo.leave(channelRef.current); } catch { /* ignore */ }
        channelRef.current     = null;
        echoChannelRef.current = null;
      }
    };
  }, [sessionId]); // ← only sessionId — callbacks accessed via refs above

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
    markAsRead,
    sendTyping,
    isTyping,
    whoIsTyping,
    onlineUsers,
  };
}
