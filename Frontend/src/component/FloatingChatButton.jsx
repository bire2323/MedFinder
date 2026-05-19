import React, { useState, useEffect, useRef } from "react";
import {
  BsChatRightFill,
  BsSendFill,
  BsJournalText,
  BsTrash,
  BsPlusLg,
  BsArrowLeft
} from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import { sendMessage } from "../api/ChatBot";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";

const MAX_ANONYMOUS_ASK_LIMIT = 3;

export default function FloatingChatButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const [isOpen, setIsOpen] = useState(false);
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const [anonymousAskCount, setAnonymousAskCount] = useState(() => {
    const saved = localStorage.getItem("medfinder_anonymous_ask_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Load chat sessions from local storage
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("medfinder_ai_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    const defaultSession = {
      id: "session_" + Date.now(),
      title: "New Chat",
      messages: [{ role: "bot", text: t("floatingChat.greeting"), buttons: [] }],
      createdAt: new Date().toISOString()
    };
    return [defaultSession];
  });

  // Track the active chat session ID
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedActive = localStorage.getItem("medfinder_ai_active_session_id");
    if (savedActive) return savedActive;
    return sessions[0]?.id || "";
  });

  // Stack view layout: 'chat' | 'sessions'
  const [view, setView] = useState("chat");

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem("medfinder_ai_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Persist activeSessionId to localStorage
  useEffect(() => {
    localStorage.setItem("medfinder_ai_active_session_id", activeSessionId);
  }, [activeSessionId]);

  // Resolve active session and messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Scroll to bottom helper
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, view]);

  // Handle modal presence block
  useEffect(() => {
    function onModalChange(e) {
      setGlobalModalOpen(!!e.detail?.open);
    }
    window.addEventListener("modal:change", onModalChange);
    return () => window.removeEventListener("modal:change", onModalChange);
  }, []);

  // Update active session's message log
  const addMessagesToActiveSession = (newMsgs) => {
    setSessions((prevSessions) => {
      return prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          let nextTitle = s.title;
          const userMsg = newMsgs.find((m) => m.role === "user");
          if (
            userMsg &&
            (s.title === "New Chat" ||
              s.title === "አዲስ ውይይት" ||
              s.title.startsWith("Chat on"))
          ) {
            nextTitle =
              userMsg.text.slice(0, 30) + (userMsg.text.length > 30 ? "..." : "");
          }
          return {
            ...s,
            title: nextTitle,
            messages: [...s.messages, ...newMsgs]
          };
        }
        return s;
      });
    });
  };

  const handleButtonClick = (payload) => {
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
      handleSend(messageToSend);
    }
  };

  const handleSend = async (messageText) => {
    const text = typeof messageText === "string" ? messageText : input;
    if (!text.trim()) return;

    if (!isLoggedIn && anonymousAskCount >= MAX_ANONYMOUS_ASK_LIMIT) {
      return;
    }

    if (!isLoggedIn) {
      const nextCount = anonymousAskCount + 1;
      setAnonymousAskCount(nextCount);
      localStorage.setItem("medfinder_anonymous_ask_count", nextCount.toString());
    }

    const userMsg = {
      role: "user",
      text: text,
      buttons: []
    };

    addMessagesToActiveSession([userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(text);

      if (data && data.length > 0) {
        const botMessages = data.map((msg) => ({
          role: "bot",
          text: msg.text,
          buttons: msg.buttons || []
        }));
        addMessagesToActiveSession(botMessages);
      } else {
        addMessagesToActiveSession([{ role: "bot", text: "..." }]);
      }
    } catch (err) {
      addMessagesToActiveSession([
        { role: "bot", text: t("floatingChat.connectionError") }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start new session
  const handleNewSession = () => {
    const newSession = {
      id: "session_" + Date.now(),
      title: t("floatingChat.newChat") || "New Chat",
      messages: [{ role: "bot", text: t("floatingChat.greeting"), buttons: [] }],
      createdAt: new Date().toISOString()
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setView("chat");
  };

  // Delete session
  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const defaultSession = {
          id: "session_" + Date.now(),
          title: t("floatingChat.newChat") || "New Chat",
          messages: [{ role: "bot", text: t("floatingChat.greeting"), buttons: [] }],
          createdAt: new Date().toISOString()
        };
        setActiveSessionId(defaultSession.id);
        return [defaultSession];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    if (window.confirm(t("floatingChat.confirmClearAll") || "Are you sure you want to delete all chat history?")) {
      const defaultSession = {
        id: "session_" + Date.now(),
        title: t("floatingChat.newChat") || "New Chat",
        messages: [{ role: "bot", text: t("floatingChat.greeting"), buttons: [] }],
        createdAt: new Date().toISOString()
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
      setView("chat");
    }
  };

  const rootStateClass = globalModalOpen ? "opacity-40 filter blur-sm pointer-events-none" : "";

  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex flex-col items-end transition-all duration-300 ${rootStateClass}`}>
      {/* 1. THE CHAT WINDOW */}
      {isOpen && (
        <div
          className="flex flex-col bg-white dark:bg-gray-900 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-gray-700 overflow-hidden transition-all duration-500 ease-in-out
          fixed bottom-0 left-0 right-0 w-full h-[80vh] rounded-t-[2.5rem]
          sm:relative sm:bottom-4 sm:w-[380px] sm:h-[550px] sm:rounded-3xl sm:mb-4"
        >
          {/* Enhanced Stacked Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-gray-800 dark:to-gray-900 p-5 text-white flex justify-between items-center shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              {view === "sessions" ? (
                <button
                  onClick={() => setView("chat")}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-md cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                  title="Back to chat"
                >
                  <BsArrowLeft size={16} />
                </button>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <RiRobot2Line className="text-2xl" />
                </div>
              )}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest leading-none">
                  {view === "sessions" ? t("floatingChat.history") : t("floatingChat.title")}
                </h3>
                {view !== "sessions" && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-bold opacity-80 uppercase tracking-wider">{t("floatingChat.onlineReady")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {view === "chat" ? (
                <>
                  <button
                    onClick={handleNewSession}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center"
                    title={t("floatingChat.newChat")}
                  >
                    <BsPlusLg size={15} />
                  </button>
                  <button
                    onClick={() => setView("sessions")}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center"
                    title={t("floatingChat.history")}
                  >
                    <BsJournalText size={15} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  {sessions.length > 0 && (
                    <button
                      onClick={handleClearAllSessions}
                      className="bg-rose-600 hover:bg-rose-700 px-2.5 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95 text-white"
                      title={t("floatingChat.clearAll")}
                    >
                      <BsTrash size={12} className="shrink-0" /> {t("floatingChat.clearAll")}
                    </button>
                  )}
                  <button
                    onClick={handleNewSession}
                    className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <BsPlusLg size={10} /> {t("floatingChat.newChat")}
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center"
              >
                <IoClose size={20} />
              </button>
            </div>
          </div>

          {/* Chat Stream View */}
          {view === "chat" ? (
            <>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-gray-955 no-scrollbar"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      style={{ whiteSpace: "pre-line" }}
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all
                        ${
                          msg.role === "user"
                            ? "bg-blue-600 dark:bg-blue-700 text-white rounded-tr-none shadow-blue-500/10"
                            : "bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-100 dark:border-gray-700/80 rounded-tl-none shadow-slate-100/50"
                        }`}
                    >
                      {msg.text}
                      {msg.buttons?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.buttons.map((btn, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleButtonClick(btn.payload)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-650 border border-blue-200/50 dark:border-gray-600 text-xs font-semibold rounded-xl text-blue-600 dark:text-blue-400 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                            >
                              {btn.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-3 text-slate-400 dark:text-gray-500">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="text-[12px] font-medium">{t("floatingChat.thinking")}</span>
                  </div>
                )}
              </div>

              {/* Premium Input Area */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 shrink-0">
                {!isLoggedIn && anonymousAskCount >= MAX_ANONYMOUS_ASK_LIMIT ? (
                  <div className="w-full flex flex-col items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-350 text-center leading-relaxed">
                      {t("floatingChat.limitReached")}
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/login", { state: { background: location } });
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-750 dark:bg-blue-700 dark:hover:bg-blue-650 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {t("floatingChat.loginNow")}
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center bg-slate-100 dark:bg-gray-800 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder={t("floatingChat.placeholder")}
                      disabled={globalModalOpen}
                      className="flex-1 bg-transparent border-none px-4 py-3 text-sm outline-none dark:text-white placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleSend}
                      disabled={globalModalOpen || !input.trim()}
                      className="bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                    >
                      <BsSendFill size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Stacked Session List View */
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-gray-955 space-y-3">
              {sessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <BsJournalText size={32} className="opacity-40 mb-2" />
                  <p className="text-xs font-semibold">{t("floatingChat.noHistory")}</p>
                </div>
              ) : (
                sessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  const lastMsg = s.messages[s.messages.length - 1];
                  const lastMsgText = lastMsg ? lastMsg.text : "";
                  const timeString = new Date(s.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setView("chat");
                      }}
                      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between
                        ${
                          isActive
                            ? "bg-blue-500/10 border-blue-500 text-blue-900 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-500"
                            : "bg-white dark:bg-gray-900/30 border-slate-100 dark:border-gray-850 hover:bg-slate-100/50 dark:hover:bg-gray-800/40"
                        }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold truncate text-slate-800 dark:text-white">
                            {s.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 truncate font-medium">
                            {lastMsgText}
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-2 font-semibold">
                            {timeString}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="hover:text-rose-600 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-400 hover:opacity-100 transition-all cursor-pointer duration-200 flex items-center justify-center self-center"
                          title="Delete session"
                        >
                          <BsTrash size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. THE FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative group overflow-hidden bg-green-800 dark:bg-green-700 hover:bg-green-700 text-white w-fit h-fit px-4 py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-300
          active:scale-90 flex items-center justify-center cursor-pointer
          ${isOpen ? "hidden sm:flex" : "flex"} 
        `}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {isOpen ? (
          <IoClose size={28} />
        ) : (
          <div className="relative">
            <BsChatRightFill size={26} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-blue-600 dark:border-blue-700 rounded-full"></span>
          </div>
        )}
      </button>
    </div>
  );
}