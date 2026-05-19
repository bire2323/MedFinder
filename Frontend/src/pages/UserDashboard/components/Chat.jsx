import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Loader2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  ChevronLeft,
  UserCircle2,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { sendMessage } from "../../../api/ChatBot";
import { apiFetch, ensureCsrfCookie } from "../../../api/client";
import apiStartChatSession from "../../../api/RealtimeChat";
import useAuthStore from "../../../store/UserAuthStore";
import * as chatApi from "../../../api/chatApi";
import SharedChatWindow from "../../../component/SharedChatWindow";
import useChatNotificationStore from "../../../store/useChatNotificationStore";

const LS_AI_LOGS_KEY = "medfinder_ai_logs_v1";
const MAX_ANONYMOUS_ASK_LIMIT = 3;

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

export default function Chat({ initialFacility: propFacility, onClearInitialFacility: propClear }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Bind defensively to React Router Outlet Context if props are undefined
  const context = useOutletContext() || {};
  const initialFacility = propFacility ?? context.chatTargetFacility;
  const onClearInitialFacility = propClear ?? (() => context.setChatTargetFacility?.(null));

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const isLoggedIn = !!user;

  const [mode, setMode] = useState("agent"); // agent | ai | history
  const [anonymousAskCount, setAnonymousAskCount] = useState(() => {
    const saved = localStorage.getItem("medfinder_anonymous_ask_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  const { sessions, setSessions, activeSessionId, setActiveSessionId } = useChatNotificationStore();
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [historyQuery, setHistoryQuery] = useState("");
  const [aiLogs, setAiLogs] = useState([]);

  const [aiDraft, setAiDraft] = useState("");
  const { targetSessionToOpen, setTargetSessionToOpen } = useChatNotificationStore();

  useEffect(() => {
    return () => {
      setActiveSessionId(null);
    };
  }, [setActiveSessionId]);

  useEffect(() => {
    if (targetSessionToOpen) {
      setMode("agent");
      setActiveSessionId(targetSessionToOpen);
      (async () => {
        try {
          await chatApi.fetchMessages(targetSessionToOpen);
        } catch (e) { }
      })();
      setTargetSessionToOpen(null);
    }
  }, [targetSessionToOpen, setTargetSessionToOpen]);

  const [aiMessages, setAiMessages] = useState([
    { role: "bot", text: t("ai.welcome"), buttons: [] },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // If navigated here with a session to open (e.g. from facility page), open it
    try {

      const params = new URLSearchParams(location.search);

      const sessionId = location.state?.openChatSessionId || params.get("session");
      //   console.log("oidt", sessionId);
      if (sessionId) {
        setActiveSessionId(String(sessionId));

        setMode('agent');
        // Load messages for that session
        (async () => {
          try {
            await chatApi.fetchMessages(sessionId);
          } catch (e) {
            // ignore
          }
        })();
      }
    } catch (e) {
      // ignore
    }

    setAiLogs(safeParseJSON(localStorage.getItem(LS_AI_LOGS_KEY), []));
  }, []);


  const loadAgentHistory = async () => {
    setHistoryLoading(true);
    setSessionsError("");
    try {
      const data = await apiFetch("/api/chat/sessions", { method: "GET" });
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      setSessionsError(e?.message || t("error.generic_error"));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Initial Load agent sessions
    setSessionsLoading(true);
    loadAgentHistory().finally(() => setSessionsLoading(false));
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
        await chatApi.fetchMessages(nextSessionId);

        onClearInitialFacility?.();
      } catch (e) {
        // Keep UI stable if session can't start
        console.error("Failed to start session:", e);
      }
    };

    start();
  }, [initialFacility, currentUserId, onClearInitialFacility]);


  // Real-time subscriptions handled by `useRealtimeChat` hook

  // useEffect(() => {
  //  // Mark messages as read (simple debounce)
  //  if (!activeSessionId || !Array.isArray(messages) || messages.length === 0) return;

  //    const t = setTimeout(async () => {
  //    try {
  //    await ensureCsrfCookie();
  //  await apiFetch(`/api/chat/sessions/${activeSessionId}/read`, { method: "POST" });
  //   } catch {
  //    // ignore; read marking is optional UX
  //   }
  //  }, 800);

  //return () => clearTimeout(t);
  //}, [activeSessionId, messages]);

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
    return chatApi.fetchMessages(sessionId);
  };

  const handleSelectSession = async (currentSession) => {
    setActiveSessionId(currentSession.id);
    try {
      await chatApi.fetchMessages(currentSession.id);
    } catch (e) {
      // ignore
    }
  };

  const startAiChat = async (messageText) => {
    const text = typeof messageText === "string" ? messageText : aiDraft.trim();
    if (!text) return;

    if (!isLoggedIn && anonymousAskCount >= MAX_ANONYMOUS_ASK_LIMIT) {
      return;
    }

    if (!isLoggedIn) {
      const nextCount = anonymousAskCount + 1;
      setAnonymousAskCount(nextCount);
      localStorage.setItem("medfinder_anonymous_ask_count", nextCount.toString());
    }

    setAiDraft("");
    setAiLoading(true);

    const nextMessages = [...aiMessages, { role: "user", text }];
    setAiMessages(nextMessages);

    try {
      const data = await sendMessage(text);
      let finalMessages = [...nextMessages];

      if (data && data.length > 0) {
        // Map all responses from the array
        const botMessages = data.map(msg => ({
          role: "bot",
          text: msg.text,
          buttons: msg.buttons || []
        }));
        finalMessages = [...finalMessages, ...botMessages];
      } else {
        // Handle empty response from Rasa
        finalMessages.push({ role: "bot", text: "...", buttons: [] });
      }
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
      const errMsg = { role: "bot", text: t("error.generic_error"), buttons: [] };
      setAiMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteAiLog = (id, e) => {
    if (e) e.stopPropagation();
    setAiLogs((prev) => {
      const updated = prev.filter((log) => log.id !== id);
      localStorage.setItem(LS_AI_LOGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleRestoreAiLog = (log) => {
    if (log && Array.isArray(log.messages)) {
      const restored = log.messages.map((m) => ({
        role: m.role,
        text: m.text,
        buttons: m.buttons || []
      }));
      setAiMessages(restored);
      setMode("ai");
    }
  };

  const handleAiButtonClick = (payload) => {
    let messageToSend = "";
    if (typeof payload === "string") {
      messageToSend = payload;
    } else if (payload && typeof payload === "object") {
      if (payload.intent) {
        messageToSend = `/${payload.intent}`;
        if (payload.data && Object.keys(payload.data).length > 0) {
          messageToSend += JSON.stringify(payload.data);
        }
      }
    }
    if (messageToSend) {
      startAiChat(messageToSend);
    }
  };

  const agentHistoryFiltered = useMemo(() => {
    const data = Array.isArray(sessions) ? sessions : [];

    // First, map over the loaded sessions to create our clean history objects
    const mapped = data.map(s => ({
      sessionId: s.id,
      facilityLabel: getFacilityLabel(s),
      createdAt: s?.created_at ?? null,
      messages: s.latest_message ? [s.latest_message] : []
    }));

    const q = historyQuery.trim().toLowerCase();
    if (!q) return mapped;

    return mapped.filter((h) => {
      // Filter by facility label
      if (h.facilityLabel.toLowerCase().includes(q)) return true;
      // Filter by the latest message content
      if (!Array.isArray(h.messages)) return false;
      return h.messages.some((m) => (m?.message ?? "").toLowerCase().includes(q));
    });
  }, [sessions, historyQuery]);

  const aiLogsFiltered = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return aiLogs;
    return aiLogs.filter((c) => {
      const anyText = Array.isArray(c?.messages) ? c.messages.map((m) => m?.text ?? "").join(" ") : "";
      return anyText.toLowerCase().includes(q) || (c?.query ?? "").toLowerCase().includes(q);
    });
  }, [aiLogs, historyQuery]);

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
          {/* Left column: session list / history list */}
          <div className={(() => {
            const base = 'col-span-12 md:col-span-12 lg:col-span-5 sticky top-14 self-start';
            const visible = activeSessionId ? 'hidden lg:block' : 'block';
            const mobileFull = !activeSessionId ? 'fixed inset-0 z-50 w-full h-screen bg-white dark:bg-gray-800/90 lg:static lg:w-auto lg:h-auto overflow-auto' : '';
            return `${base} ${visible} ${mobileFull}`;
          })()}>
            <div className="rounded-2xl border border-slate-100 dark:border-gray-800/80 bg-white dark:bg-gray-955/40 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-gray-900">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-650 dark:text-slate-200 hover:scale-105 transition-transform"
                    aria-label="Back"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">{mode === "agent" ? t("Chat.Chats") : mode === "ai" ? t("Chat.AiAssistant") : t("Chat.ChatHistory")}</h2>
                </div>

                {/* Sliding Pill Mode Switcher */}
                <div className="flex p-1 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-xl gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMode("agent")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${mode === "agent"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-slate-200 bg-transparent"
                      }`}
                  >
                    {t("Chat.Agent")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("history")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${mode === "history"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-slate-200 bg-transparent"
                      }`}
                  >
                    {t("Chat.Logs")}
                  </button>
                </div>
              </div>

              {mode === "agent" && (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("Chat.ConversationList")}</div>
                    <button
                      type="button"
                      onClick={() => setMode("history")}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-450 hover:underline"
                    >
                      {t("Chat.SearchLogs")}
                    </button>
                  </div>

                  {sessionsError && (
                    <div className="text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                      {sessionsError}
                    </div>
                  )}

                  {sessionsLoading ? (
                    <div className="mt-4 flex items-center gap-3 text-slate-500 dark:text-gray-400">
                      <Loader2 size={18} className="animate-spin text-emerald-500" />
                      {t("Common.Loading")}
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="mt-4 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl py-8 px-4 text-center bg-slate-50/50 dark:bg-gray-900/10">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("Chat.NoAgentChatsYet")}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t("Chat.StartChatFromSearch")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {sessions.map((s) => {
                        const sid = String(s.id);
                        const label = getFacilityLabel(s);
                        const isActive = String(activeSessionId) === sid;
                        return (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => handleSelectSession(s)}
                            className={`w-full text-left rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${isActive
                                ? "bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500"
                                : "bg-white dark:bg-gray-900/30 border-slate-100 dark:border-gray-850 hover:bg-slate-50 dark:hover:bg-gray-800/50"
                              }`}
                          >
                            <div className="w-full flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate text-slate-800 dark:text-white">{label}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 truncate">
                                  {s.last_message || (s.pharmacy?.pharmacy_name_en ? "Pharmacy Agent" : s.hospital?.hospital_name_en ? "Hospital Agent" : "Agent")}
                                </p>
                              </div>
                              {s.unread_count > 0 ? (
                                <span className="shrink-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                  {s.unread_count}
                                </span>
                              ) : (
                                <span className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                                  <UserCircle2 size={16} />
                                </span>
                              )}
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
                  <div className="border border-slate-100 dark:border-gray-850 rounded-2xl p-4 bg-slate-50/50 dark:bg-gray-900/30">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-600 animate-pulse" />
                      <p className="font-bold text-slate-800 dark:text-white">{t("Chat.AiChatbot")}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                      {t("Chat.AiChatbotDescription")}
                    </p>
                  </div>
                </div>
              )}

              {mode === "history" && (
                <div className="mt-5">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={historyQuery}
                      onChange={(e) => setHistoryQuery(e.target.value)}
                      placeholder={t("Chat.SearchInAiAndAgent")}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-55 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-850 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-200"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={loadAgentHistory}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      disabled={historyLoading}
                    >
                      {historyLoading ? t("Common.Loading") : t("Chat.RefreshAgentLogs")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem(LS_AI_LOGS_KEY, JSON.stringify([]));
                        setAiLogs([]);
                      }}
                      className="text-xs font-bold text-rose-600 dark:text-rose-450 hover:underline"
                      title={t("Chat.ClearAi")}
                    >
                      {t("Chat.ClearAi")}
                    </button>
                  </div>

                  <div className="mt-5 space-y-5 max-h-[420px] overflow-y-auto pr-1">
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t("Chat.AiChatLogs")}</p>
                      {aiLogsFiltered.length === 0 ? (
                        <div className="border border-dashed border-slate-200 dark:border-gray-850 rounded-2xl py-6 px-4 text-center bg-slate-50/50 dark:bg-gray-900/10">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("Chat.NoAiLogsYet")}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t("Chat.AskSomethingInAiTab")}</p>
                        </div>
                      ) : (
                        aiLogsFiltered.slice(0, 10).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleRestoreAiLog(c)}
                            className="border border-slate-100 dark:border-gray-800/80 rounded-2xl p-4 bg-white dark:bg-gray-900/30 shadow-sm hover:border-emerald-500/60 hover:shadow-md cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-800 dark:text-white truncate">{c.query}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t("Admin.SavedAt")} {new Date(c.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAiLog(c.id, e)}
                                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-855 transition-colors flex items-center justify-center cursor-pointer"
                                  title={t("Common.Delete") || "Delete log"}
                                >
                                  <Trash2 size={15} />
                                </button>
                                <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                                  <Sparkles size={16} />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t("Chat.AgentChatLogs")}</p>
                      {sessionsLoading ? (
                        <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                          <Loader2 size={18} className="animate-spin text-emerald-500" />
                          {t("Common.Loading")}
                        </div>
                      ) : agentHistoryFiltered.length === 0 ? (
                        <div className="border border-dashed border-slate-200 dark:border-gray-850 rounded-2xl py-6 px-4 text-center bg-slate-50/50 dark:bg-gray-900/10">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("Chat.NoAgentLogsYet")}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t("Chat.StartPharmacyChat")}</p>
                        </div>
                      ) : (
                        agentHistoryFiltered.slice(0, 10).map((h) => (
                          <button
                            key={String(h.sessionId)}
                            type="button"
                            onClick={() => {
                              handleSelectSession({ id: h.sessionId });
                              setMode("agent");
                            }}
                            className="w-full text-left border border-slate-100 dark:border-gray-800/80 rounded-2xl p-4 bg-white dark:bg-gray-900/30 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-all duration-200 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-white truncate">{h.facilityLabel}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 truncate">{lastMessageText(h.messages) || t("chat.no_messages")}</p>
                              </div>
                              <span className="shrink-0 w-9 h-9 rounded-xl bg-emerald-550/10 text-emerald-600 dark:bg-emerald-550/15 dark:text-emerald-450 flex items-center justify-center shadow-inner">
                                <MessageSquare size={16} />
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: message panel */}
          <div className={(() => {
            const base = 'col-span-12 z-999 md:z-20 md:col-span-8 lg:col-span-7';
            const visible = !activeSessionId ? 'hidden lg:block' : 'block';
            const mobileFull = activeSessionId ? 'fixed inset-0 z-50 w-full h-screen bg-white dark:bg-gray-900/90 lg:static lg:w-auto lg:h-auto' : '';
            return `${base} ${visible} ${mobileFull}`;
          })()}>
            <div className={`
              flex flex-col overflow-hidden
              ${activeSessionId ? 'h-screen' : 'h-full'} md:h-[90vh] lg:h-[80vh]
              rounded-none md:rounded-2xl
              border-0 md:border border-slate-100 dark:border-gray-800/80
              bg-white dark:bg-gray-955/40 shadow-sm
              md:mt-5
            `}>
              {mode === "agent" && (
                <>
                  <div className="p-4 border-b border-slate-100 dark:border-gray-900 hidden lg:flex items-center justify-between gap-3 shrink-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white truncate">
                        {activeSession ? getFacilityLabel(activeSession) : t("Chat.SelectAChatSession")}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                        {t("Chat.RealTimeMessages")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode("history")}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline hidden sm:inline-flex"
                    >
                      {t("Chat.ViewLogs")}
                    </button>
                  </div>

                  {activeSessionId ? (
                    <div className="flex-1 overflow-hidden relative">
                      <SharedChatWindow
                        sessionId={activeSessionId}
                        currentUserId={currentUserId}
                        otherParticipantName={activeSession ? getFacilityLabel(activeSession) : t("Chat.Agent")}
                        onBack={() => setActiveSessionId(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-xs text-slate-500 dark:text-gray-400 text-center p-5 font-semibold">
                        {t("Chat.PickASession")}
                      </div>
                    </div>
                  )}
                </>
              )}

              {mode === "ai" && (
                <>
                  <div className="p-4 border-b border-slate-100 dark:border-gray-900 bg-white dark:bg-gray-900/30">
                    <p className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                      <Sparkles size={18} className="text-emerald-600" />
                      {t("Chat.AiAssistant")}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-gray-955/40">
                    {aiMessages.map((m, idx) => (
                      <div key={`${m.role}-${idx}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={[
                            "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                            m.role === "user"
                              ? "bg-gradient-to-r from-emerald-600 to-teal-650 text-white rounded-br-none shadow-sm shadow-emerald-650/10"
                              : "bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-gray-850 rounded-bl-none shadow-sm",
                          ].join(" ")}
                        >
                          {m.text}
                          {m.buttons?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {m.buttons.map((btn, btnIdx) => (
                                <button
                                  key={btnIdx}
                                  onClick={() => handleAiButtonClick(btn.payload)}
                                  className="px-3 py-1.5 bg-emerald-55 hover:bg-emerald-100 dark:bg-gray-700 dark:hover:bg-gray-650 border border-emerald-200/50 dark:border-gray-600 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                                >
                                  {btn.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                        <Loader2 size={18} className="animate-spin text-emerald-500" />
                        {t("Chat.AiThinking")}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-gray-905 bg-white dark:bg-gray-900/30 shrink-0">
                    {!isLoggedIn && anonymousAskCount >= MAX_ANONYMOUS_ASK_LIMIT ? (
                      <div className="w-full flex flex-col items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
                        <p className="text-xs font-semibold text-rose-700 dark:text-rose-350 text-center leading-relaxed">
                          {t("floatingChat.limitReached")}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/login", { state: { background: location } })}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          {t("floatingChat.loginNow")}
                        </button>
                      </div>
                    ) : (
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
                          placeholder={t("Chat.AskAboutMedicines")}
                          className="flex-1 rounded-2xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-850 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={startAiChat}
                          disabled={aiLoading || !aiDraft.trim()}
                          className="shrink-0 rounded-2xl bg-emerald-600 text-white px-4 py-3 font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-650/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {aiLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : <Send size={18} className="mx-auto" />}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {mode === "history" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="border border-slate-100 dark:border-gray-850 rounded-2xl bg-slate-50/50 dark:bg-gray-950/30 p-4 shadow-sm">
                    <p className="font-bold text-slate-800 dark:text-white">{t("Chat.ChatHistory")}</p>
                    <p className="text-sm text-slate-555 mt-2">
                      {t("Chat.AiChatbotDescription")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


