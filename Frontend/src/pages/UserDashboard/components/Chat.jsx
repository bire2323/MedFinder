import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { sendMessage } from "../../../api/ChatBot";
import { apiFetch, ensureCsrfCookie } from "../../../api/client";
import apiStartChatSession from "../../../api/RealtimeChat";
import useAuthStore from "../../../store/UserAuthStore";

const LS_AI_LOGS_KEY = "medfinder_ai_logs_v1";

function safeParseJSON(value, fallback) {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function nowISO() {
  return new Date().toISOString();
}

function getFacilityLabel(session) {
  const pharmacyName = session?.pharmacy?.pharmacy_name_en ?? session?.pharmacy?.name;
  const hospitalName = session?.hospital?.hospital_name_en ?? session?.hospital?.name;
  return pharmacyName || hospitalName || "Facility";
}

function lastMessageText(msgs) {
  if (!Array.isArray(msgs) || msgs.length === 0) return "";
  const last = msgs[msgs.length - 1];
  return last?.message ?? last?.text ?? "";
}

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function Chat({ initialFacility, onClearInitialFacility }) {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [mode, setMode] = useState("agent"); // agent | ai | history
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [historyQuery, setHistoryQuery] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [aiLogs, setAiLogs] = useState([]);
  const [agentHistory, setAgentHistory] = useState([]); // { sessionId, facilityLabel, createdAt, messages:[] }

  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  const [aiDraft, setAiDraft] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "bot", text: "Hello! I am MedFinder AI. Ask about symptoms, medicines, or nearby facilities." },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setAiLogs(safeParseJSON(localStorage.getItem(LS_AI_LOGS_KEY), []));
  }, []);

  useEffect(() => {
    // Load agent sessions
    setSessionsLoading(true);
    setSessionsError("");
    apiFetch("/api/chat/sessions", { method: "GET" })
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch((e) => setSessionsError(e?.message || "Failed to load chat sessions."))
      .finally(() => setSessionsLoading(false));
  }, []);

  useEffect(() => {
    // Start chat with facility when requested from MapView (or recents/favorites)
    if (!initialFacility || !currentUserId) return;

    const start = async () => {
      try {
        if (!["pharmacy", "hospital"].includes(initialFacility.type)) return;

        const language = "en";
        const payload =
          initialFacility.type === "pharmacy"
            ? { pharmacy_id: initialFacility.id, language }
            : { hospital_id: initialFacility.id, language };

        const created = await apiStartChatSession(payload);
        const nextSessionId = created?.id ?? created?.chat_session_id ?? null;
        if (!nextSessionId) return;

        setActiveSessionId(nextSessionId);
        setMode("agent");

        // Load messages for the session immediately
        const data = await apiFetch(`/api/chat/sessions/${nextSessionId}/messages`, { method: "GET" });
        const msgs = Array.isArray(data) ? data : Object.values(data || {});
        setMessages(Array.isArray(msgs) ? msgs.reverse() : []);

        onClearInitialFacility?.();
      } catch (e) {
        // Keep UI stable if session can't start
        console.error("Failed to start session:", e);
      }
    };

    start();
  }, [initialFacility, currentUserId, onClearInitialFacility]);

  useEffect(() => {
    // Scroll to bottom on new agent messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Subscribe to real-time updates
    if (!activeSessionId || !window.Echo) return;

    // Clean old subscription
    try {
      if (subscriptionRef.current) {
        window.Echo.leave(subscriptionRef.current);
      }
    } catch {
      // ignore
    }

    const channelName = `chat.session.${activeSessionId}`;
    subscriptionRef.current = channelName;

    const channel = window.Echo.join(channelName)
      .listen(".message.sent", (e) => {
        const incoming = e?.message ?? e;
        const incomingMessage = {
          id: incoming?.id ?? e?.id,
          chat_session_id: incoming?.chat_session_id ?? e?.chat_session_id,
          sender_id: incoming?.sender_id ?? e?.sender_id,
          message: incoming?.message ?? e?.message,
          is_read: incoming?.is_read ?? false,
          created_at: incoming?.created_at ?? e?.created_at,
        };

        setMessages((prev) => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const dedupeId = String(incomingMessage?.id ?? "");
          if (dedupeId && prevArr.some((m) => String(m?.id ?? "") === dedupeId)) return prevArr;
          return [...prevArr, incomingMessage].filter((m) => m && m.message != null);
        });
      })
      .listen(".message.read", () => {
        // Optional: mark read status
      });

    return () => {
      try {
        window.Echo.leave(channelName);
      } catch {
        // ignore
      }
      try {
        channel?.stopListening?.();
      } catch {
        // ignore
      }
    };
  }, [activeSessionId]);

  useEffect(() => {
    // Mark messages as read (simple debounce)
    if (!activeSessionId || !Array.isArray(messages) || messages.length === 0) return;

    const t = setTimeout(async () => {
      try {
        await ensureCsrfCookie();
        await apiFetch(`/api/chat/sessions/${activeSessionId}/read`, { method: "POST" });
      } catch {
        // ignore; read marking is optional UX
      }
    }, 800);

    return () => clearTimeout(t);
  }, [activeSessionId, messages]);

  const agentSessionsById = useMemo(() => {
    const m = new Map();
    for (const s of sessions) {
      const sid = String(s?.id ?? "");
      if (sid) m.set(sid, s);
    }
    return m;
  }, [sessions]);

  const activeSession = activeSessionId ? agentSessionsById.get(String(activeSessionId)) : null;

  const loadMessagesForSession = async (sessionId) => {
    const data = await apiFetch(`/api/chat/sessions/${sessionId}/messages`, { method: "GET" });
    const msgs = Array.isArray(data) ? data : Object.values(data || {});
    setMessages(Array.isArray(msgs) ? msgs.reverse() : []);
  };

  const handleSelectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    try {
      await loadMessagesForSession(sessionId);
    } catch (e) {
      setMessages([]);
    }
  };

  const handleSendAgentMessage = async () => {
    const text = newMessage.trim();
    if (!text || !activeSessionId) return;

    setSending(true);
    setNewMessage("");

    try {
      await ensureCsrfCookie();
      const res = await apiFetch(`/api/chat/sessions/${activeSessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      // Sender doesn't receive broadcast (toOthers()), so append locally
      if (res) {
        const optimistic = {
          id: res?.id,
          chat_session_id: res?.chat_session_id ?? activeSessionId,
          sender_id: res?.sender_id ?? currentUserId,
          message: res?.message ?? text,
          is_read: res?.is_read ?? true,
          created_at: res?.created_at ?? nowISO(),
        };
        setMessages((prev) => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const dedupeId = String(optimistic?.id ?? "");
          if (dedupeId && prevArr.some((m) => String(m?.id ?? "") === dedupeId)) return prevArr;
          return [...prevArr, optimistic];
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        {
          id: `local-${Date.now()}`,
          sender_id: currentUserId,
          chat_session_id: activeSessionId,
          message: text,
          is_read: true,
          created_at: nowISO(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const startAiChat = async () => {
    const text = aiDraft.trim();
    if (!text) return;
    setAiDraft("");
    setAiLoading(true);

    const nextMessages = [...aiMessages, { role: "user", text }];
    setAiMessages(nextMessages);

    try {
      const data = await sendMessage(text);
      const replyText = data?.reply ?? data?.response?.reply ?? data?.message ?? "No reply received.";
      const botMsg = { role: "bot", text: replyText };
      const finalMessages = [...nextMessages, botMsg];
      setAiMessages(finalMessages);

      // Save conversation log for history search
      const logs = safeParseJSON(localStorage.getItem(LS_AI_LOGS_KEY), []);
      const conv = {
        id: `ai-${Date.now()}`,
        createdAt: nowISO(),
        query: text,
        messages: finalMessages.map((m) => ({ role: m.role, text: m.text })),
      };
      const merged = [conv, ...(Array.isArray(logs) ? logs : [])].slice(0, 50);
      localStorage.setItem(LS_AI_LOGS_KEY, JSON.stringify(merged));
      setAiLogs(merged);
    } catch {
      const errMsg = { role: "bot", text: "I'm having trouble connecting. Please try again." };
      setAiMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const agentHistoryFiltered = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return agentHistory;
    return agentHistory.filter((h) => {
      if (!Array.isArray(h.messages)) return false;
      return h.messages.some((m) => (m?.message ?? "").toLowerCase().includes(q));
    });
  }, [agentHistory, historyQuery]);

  const aiLogsFiltered = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return aiLogs;
    return aiLogs.filter((c) => {
      const anyText = Array.isArray(c?.messages) ? c.messages.map((m) => m?.text ?? "").join(" ") : "";
      return anyText.toLowerCase().includes(q) || (c?.query ?? "").toLowerCase().includes(q);
    });
  }, [aiLogs, historyQuery]);

  const loadAgentHistory = async () => {
    setHistoryLoading(true);
    setAgentHistory([]);
    setHistoryQuery((v) => v);

    try {
      // Fetch sessions first, then last messages per session
      const data = Array.isArray(sessions) ? sessions : [];
      const next = [];

      for (const s of data.slice(0, 30)) {
        try {
          const msgs = await apiFetch(`/api/chat/sessions/${s.id}/messages`, { method: "GET" });
          const msgsArr = Array.isArray(msgs) ? msgs : Object.values(msgs || {});
          const last = Array.isArray(msgsArr) ? msgsArr.slice(-20) : [];
          next.push({
            sessionId: s.id,
            facilityLabel: getFacilityLabel(s),
            createdAt: s?.created_at ?? null,
            messages: last,
          });
        } catch {
          next.push({
            sessionId: s.id,
            facilityLabel: getFacilityLabel(s),
            createdAt: s?.created_at ?? null,
            messages: [],
          });
        }
      }

      setAgentHistory(next);
    } catch (e) {
      // ignore; UI will show empty state
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "history") return;
    // Load history once when entering
    if (agentHistory.length === 0 && !historyLoading) {
      loadAgentHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[520px]">
      {/* Left column: session list / history list */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-extrabold">{mode === "agent" ? "Chats" : mode === "ai" ? "AI Assistant" : "Chat History"}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("agent")}
                className={[
                  "px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors",
                  mode === "agent"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50",
                ].join(" ")}
              >
                Agent
              </button>
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={[
                  "px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors hidden sm:inline-flex",
                  mode === "ai"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50",
                ].join(" ")}
              >
                AI
              </button>
              <button
                type="button"
                onClick={() => setMode("history")}
                className={[
                  "px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors hidden sm:inline-flex",
                  mode === "history"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50",
                ].join(" ")}
              >
                Logs
              </button>
            </div>
          </div>

          {mode === "agent" && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Conversation list</div>
                <button
                  type="button"
                  onClick={() => setMode("history")}
                  className="text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Search logs
                </button>
              </div>

              {sessionsError && (
                <div className="text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                  {sessionsError}
                </div>
              )}

              {sessionsLoading ? (
                <div className="mt-4 flex items-center gap-3 text-slate-600 dark:text-gray-300">
                  <Loader2 size={20} className="animate-spin" />
                  Loading sessions…
                </div>
              ) : sessions.length === 0 ? (
                <div className="mt-4 border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                  <p className="font-extrabold">No agent chats yet</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Start a chat from Search → Pharmacy results.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {sessions.map((s) => {
                    const sid = String(s.id);
                    const label = getFacilityLabel(s);
                    const isActive = String(activeSessionId) === sid;
                    return (
                      <button
                        key={sid}
                        type="button"
                        onClick={() => handleSelectSession(s.id)}
                        className={[
                          "w-full text-left rounded-2xl p-3 border transition-colors",
                          isActive
                            ? "bg-blue-600/10 border-blue-600 text-blue-700 dark:text-blue-300"
                            : "bg-white dark:bg-gray-900/30 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold truncate">{label}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                              {s.pharmacy?.pharmacy_name_en ? "Pharmacy Agent" : s.hospital?.hospital_name_en ? "Hospital Agent" : "Agent"}
                            </p>
                          </div>
                          <span className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-700/60 flex items-center justify-center">
                            <UserCircle2 size={16} className="text-slate-600 dark:text-slate-200" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {mode === "ai" && (
            <div className="mt-4">
              <div className="border border-slate-200 dark:border-gray-700 rounded-2xl p-4 bg-slate-50 dark:bg-gray-900/30">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  <p className="font-extrabold">AI Chatbot</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                  Use this chatbot to get help about symptoms, medicines, and nearby facilities. Logs are saved for History search.
                </p>
              </div>
            </div>
          )}

          {mode === "history" && (
            <div className="mt-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="Search in AI + Agent conversations…"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={loadAgentHistory}
                  className="text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:underline"
                  disabled={historyLoading}
                >
                  {historyLoading ? "Loading..." : "Refresh agent logs"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(LS_AI_LOGS_KEY, JSON.stringify([]));
                    setAiLogs([]);
                  }}
                  className="text-xs font-extrabold text-rose-700 dark:text-rose-300 hover:underline"
                  title="Clear AI logs"
                >
                  Clear AI
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-600 dark:text-gray-300 uppercase tracking-widest">AI Chat Logs</p>
                  {aiLogsFiltered.length === 0 ? (
                    <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                      <p className="font-extrabold">No AI logs yet</p>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Ask something in the AI tab to generate logs.</p>
                    </div>
                  ) : (
                    aiLogsFiltered.slice(0, 10).map((c) => (
                      <div key={c.id} className="border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold truncate">{c.query}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">Saved at {new Date(c.createdAt).toLocaleString()}</p>
                          </div>
                          <span className="shrink-0 w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                            <Sparkles size={16} />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-600 dark:text-gray-300 uppercase tracking-widest">Agent Chat Logs</p>
                  {historyLoading ? (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                      <Loader2 size={18} className="animate-spin" />
                      Loading…
                    </div>
                  ) : agentHistoryFiltered.length === 0 ? (
                    <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                      <p className="font-extrabold">No agent logs yet</p>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Start a pharmacy chat to generate conversation history.</p>
                    </div>
                  ) : (
                    agentHistoryFiltered.slice(0, 10).map((h) => (
                      <div key={String(h.sessionId)} className="border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold truncate">{h.facilityLabel}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate">{lastMessageText(h.messages) || "No messages."}</p>
                          </div>
                          <span className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-700/60 flex items-center justify-center">
                            <MessageSquare size={16} className="text-slate-700 dark:text-slate-200" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right column: message panel */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 overflow-hidden h-full flex flex-col">
          {mode === "agent" && (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <p className="font-extrabold truncate">
                    {activeSession ? getFacilityLabel(activeSession) : "Select a chat session"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                    Real-time messages with pharmacy agents (via Laravel Reverb).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("history")}
                  className="text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:underline hidden sm:inline-flex"
                >
                  View logs
                </button>
              </div>

              {activeSessionId ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-gray-950/40">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-slate-600 dark:text-gray-300">
                        No messages yet.
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isOwn = String(m?.sender_id ?? "") === String(currentUserId ?? "");
                        return (
                          <div key={String(m?.id ?? `${m?.created_at ?? ""}-${Math.random()}`)} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div
                              className={[
                                "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                isOwn
                                  ? "bg-blue-600 text-white rounded-br-none"
                                  : "bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-gray-700 rounded-bl-none",
                              ].join(" ")}
                            >
                              <p className="whitespace-pre-wrap">{m?.message ?? ""}</p>
                              <div className="mt-2 flex items-center justify-end gap-2 text-xs opacity-80">
                                <span>{formatTime(m?.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 shrink-0">
                    <div className="relative flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAgentMessage();
                          }
                        }}
                        placeholder="Type a message to the pharmacy agent…"
                        className="flex-1 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleSendAgentMessage}
                        disabled={sending || !newMessage.trim()}
                        className="shrink-0 rounded-2xl bg-blue-600 text-white px-4 py-3 font-extrabold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                      >
                        {sending ? <Loader2 size={18} className="animate-spin mx-auto" /> : <Send size={18} className="mx-auto" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-300 mt-2">
                      Tip: ask about availability, price, and delivery to your location.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-sm text-slate-600 dark:text-gray-300 text-center">
                    Pick a session from the left, or start a chat from Search → Pharmacy results.
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "ai" && (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30">
                <p className="font-extrabold flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  AI Assistant (logs saved for history)
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-gray-950/40">
                {aiMessages.map((m, idx) => (
                  <div key={`${m.role}-${idx}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={[
                        "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-gray-700 rounded-bl-none",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                    <Loader2 size={18} className="animate-spin" />
                    Assistant is thinking…
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiDraft}
                    onChange={(e) => setAiDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        startAiChat();
                      }
                    }}
                    placeholder="Ask about medicines, symptoms, or nearby facilities…"
                    className="flex-1 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={startAiChat}
                    disabled={aiLoading || !aiDraft.trim()}
                    className="shrink-0 rounded-2xl bg-blue-600 text-white px-4 py-3 font-extrabold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : <Send size={18} className="mx-auto" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === "history" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="border border-slate-200 dark:border-gray-700 rounded-2xl bg-slate-50 dark:bg-gray-950/30 p-4">
                <p className="font-extrabold">History is shown in the left panel</p>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                  Use the search box to filter AI chatbot logs and human agent conversations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

