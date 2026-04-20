import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import {
  Loader2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  UserCircle2,
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
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [mode, setMode] = useState("agent"); // agent | ai | history
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
    { role: "bot", text: t("ai.welcome") },
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

  const startAiChat = async () => {
    const text = aiDraft.trim();
    if (!text) return;
    setAiDraft("");
    setAiLoading(true);

    const nextMessages = [...aiMessages, { role: "user", text }];
    setAiMessages(nextMessages);

    try {
      const data = await sendMessage(text);
      const replyText = data?.reply ?? data?.response?.reply ?? data?.message ?? t("error.generic_error");
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
      const errMsg = { role: "bot", text: t("error.generic_error") };
      setAiMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[520px]">
      {/* Left column: session list / history list */}
      <div className={`col-span-12 md:col-span-12 lg:col-span-5 sticky top-14 self-start ${activeSessionId ? 'hidden lg:block' : 'block'}`}>
        <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-extrabold">{mode === "agent" ? t("Chat.Chats") : mode === "ai" ? t("Chat.AiAssistant") : t("Chat.ChatHistory")}</h2>
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
                {t("Chat.Agent")}
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
                {t("Chat.Ai")}
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
                {t("Chat.Logs")}
              </button>
            </div>
          </div>

          {mode === "agent" && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{t("Chat.ConversationList")}</div>
                <button
                  type="button"
                  onClick={() => setMode("history")}
                  className="text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:underline"
                >
                  {t("Chat.SearchLogs")}
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
                  {t("Common.Loading")}
                </div>
              ) : sessions.length === 0 ? (
                <div className="mt-4 border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                  <p className="font-extrabold">{t("Chat.NoAgentChatsYet")}</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("Chat.StartChatFromSearch")}</p>
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
                        onClick={() => handleSelectSession(s)}
                        className={[
                          "w-full text-left rounded-2xl p-3 border transition-colors",
                          isActive
                            ? "bg-blue-600/10 border-blue-600 text-blue-700 dark:text-blue-300"
                            : "bg-white dark:bg-gray-900/30 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{label}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate">
                              {s.last_message || (s.pharmacy?.pharmacy_name_en ? "Pharmacy Agent" : s.hospital?.hospital_name_en ? "Hospital Agent" : "Agent")}
                            </p>
                          </div>
                          {s.unread_count > 0 ? (
                            <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold px-0.5 sm:px-2 py-0.5 rounded-full">
                              {s.unread_count}
                            </span>
                          ) : (
                            <span className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-700/60 flex items-center justify-center">
                              <UserCircle2 size={16} className="text-slate-600 dark:text-slate-200" />
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
              <div className="border border-slate-200 dark:border-gray-700 rounded-2xl p-4 bg-slate-50 dark:bg-gray-900/30">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  <p className="font-extrabold">{t("Chat.AiChatbot")}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                  {t("Chat.AiChatbotDescription")}
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
                  placeholder={t("Chat.SearchInAiAndAgent")}
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
                  {historyLoading ? t("Common.Loading") : t("Chat.RefreshAgentLogs")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(LS_AI_LOGS_KEY, JSON.stringify([]));
                    setAiLogs([]);
                  }}
                  className="text-xs font-extrabold text-rose-700 dark:text-rose-300 hover:underline"
                  title={t("Chat.ClearAi")}
                >
                  {t("Chat.ClearAi")}
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-600 dark:text-gray-300 uppercase tracking-widest">{t("Chat.AiChatLogs")}</p>
                  {aiLogsFiltered.length === 0 ? (
                    <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                      <p className="font-extrabold">{t("Chat.NoAiLogsYet")}</p>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("Chat.AskSomethingInAiTab")}</p>
                    </div>
                  ) : (
                    aiLogsFiltered.slice(0, 10).map((c) => (
                      <div key={c.id} className="border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold truncate">{c.query}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{t("Admin.SavedAt")} {new Date(c.createdAt).toLocaleString()}</p>
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
                  <p className="text-xs font-extrabold text-slate-600 dark:text-gray-300 uppercase tracking-widest">{t("Chat.AgentChatLogs")}</p>
                  {sessionsLoading ? (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                      <Loader2 size={18} className="animate-spin" />
                      {t("Common.Loading")}
                    </div>
                  ) : agentHistoryFiltered.length === 0 ? (
                    <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                      <p className="font-extrabold">{t("Chat.NoAgentLogsYet")}</p>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("Chat.StartPharmacyChat")}</p>
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
                        className="w-full text-left border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold truncate">{h.facilityLabel}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate">{lastMessageText(h.messages) || t("chat.no_messages")}</p>
                          </div>
                          <span className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-700/60 flex items-center justify-center">
                            <MessageSquare size={16} className="text-slate-700 dark:text-slate-200" />
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
      <div className={`col-span-12 z-999 md:z-20 md:col-span-8 lg:col-span-7
  ${!activeSessionId ? 'hidden lg:block' : 'block'}
  fixed inset-0 z-50 bg-white dark:bg-gray-900
  md:relative md:z-auto md:bg-transparent
`}>
        <div className="
  flex flex-col overflow-hidden
  h-full md:h-[90vh]
  rounded-none md:rounded-2xl
  border-0 md:border border-slate-200 dark:border-gray-700
  bg-white dark:bg-gray-800/40
  md:mt-5
">
          {mode === "agent" && (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-gray-700 hidden lg:flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <p className="font-extrabold truncate">
                    {activeSession ? getFacilityLabel(activeSession) : t("Chat.SelectAChatSession")}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                    {t("Chat.RealTimeMessages")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("history")}
                  className="text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:underline hidden sm:inline-flex"
                >
                  {t("Chat.ViewLogs")}
                </button>
              </div>

              {activeSessionId ? (
                <div className="flex-1  overflow-hidden relative">
                  <SharedChatWindow
                    sessionId={activeSessionId}
                    currentUserId={currentUserId}
                    otherParticipantName={activeSession ? getFacilityLabel(activeSession) : t("Chat.Agent")}
                    onBack={() => setActiveSessionId(null)}
                  />
                </div>
              ) : (
                <div className="flex-1  flex items-center justify-center">
                  <div className="text-sm text-slate-600 dark:text-gray-300 text-center p-5">
                    {t("Chat.PickASession")}
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
                  {t("Chat.AiAssistant")}
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
                    {t("Chat.AiThinking")}
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
                    placeholder={t("Chat.AskAboutMedicines")}
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
                <p className="font-extrabold">{t("Chat.ChatHistory")}</p>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                  {t("Chat.AiChatbotDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

