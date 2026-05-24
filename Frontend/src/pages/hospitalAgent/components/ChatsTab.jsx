import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquare, Search, ChevronLeft, User, Info } from "lucide-react";
import SharedChatWindow from "../../../component/SharedChatWindow";
import useChatNotificationStore from "../../../store/useChatNotificationStore";

export default function ChatsTab() {
  const { currentUserId } = useOutletContext();
  const {
    sessions: chatSessions,
    loadSessions,
    activeSessionId: selectedSessionId,
    setActiveSessionId: setSelectedSessionId,
    targetSessionToOpen,
    setTargetSessionToOpen
  } = useChatNotificationStore();

  const navigate = useNavigate();
  const [loadingChats, setLoadingChats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (targetSessionToOpen) {
      setSelectedSessionId(targetSessionToOpen);
      setTargetSessionToOpen(null);
    }
  }, [targetSessionToOpen, setTargetSessionToOpen, setSelectedSessionId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = location.state?.openChatSessionId || params.get("session");
    if (sessionId) {
      setTargetSessionToOpen(sessionId);
    }
  }, [location.search, location.state, setTargetSessionToOpen]);

  useEffect(() => {
    return () => {
      setSelectedSessionId(null);
    };
  }, [setSelectedSessionId]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (chatSessions.length === 0) {
        setLoadingChats(true);
      }
      await loadSessions();
      setLoadingChats(false);
    };
    fetchSessions();
  }, []);

  const filteredSessions = chatSessions.filter(session =>
    session.patient?.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      key="chats"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-220px)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden shadow-xl"
    >
      <div className="flex h-full relative">
        {/* Chat list */}
        <div
          className={`w-full lg:w-[360px] border-r border-slate-100 dark:border-slate-850 flex flex-col bg-slate-50/30 dark:bg-slate-950/20 transition-all duration-300 ${selectedSessionId ? "hidden lg:flex" : "flex"}`}
        >
          <div className="p-5 space-y-3.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:scale-105 transition-transform"
                  aria-label="Back"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Conversations</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                {chatSessions.length} active
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs shadow-sm text-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1.5 no-scrollbar">
            {loadingChats ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Loading Encrypted Chats</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/20 dark:border-slate-850">
                  <MessageSquare size={20} className="text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-450 dark:text-slate-500">No conversations found</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full group p-3.5 rounded-2xl text-left transition-all duration-200 relative ${selectedSessionId === session.id
                      ? "bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 scale-[0.99] z-10"
                      : "hover:bg-white/40 dark:hover:bg-slate-900/30 border border-transparent"
                    }`}
                >
                  {selectedSessionId === session.id && (
                    <motion.div
                      layoutId="active-hospital-chat"
                      className="absolute inset-y-3.5 left-0 w-1 bg-blue-500 rounded-full"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform duration-300 group-hover:scale-105 shadow-sm ${selectedSessionId === session.id
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/30"
                        }`}>
                        {session.patient?.Name?.[0]?.toUpperCase() || <User size={16} />}
                      </div>
                      {session.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white dark:border-slate-900 shadow-md animate-bounce">
                          {session.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-black text-slate-800 dark:text-white truncate tracking-tight text-xs">
                          {session.patient?.Name || "Patient"}
                        </h4>
                        <span className="text-[8px] font-semibold text-slate-400 shrink-0">
                          {session.last_message_at ? new Date(session.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate ${session.unread_count > 0 ? "font-black text-blue-600 dark:text-blue-400" : "font-semibold text-slate-400 dark:text-slate-500"}`}>
                        {session.last_message?.message || session.last_message || "Start messaging..."}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window container */}
        <div className={(() => {
          const base = "flex-1 flex flex-col bg-white dark:bg-slate-900/10 h-full overflow-hidden transition-all duration-300";
          const visibility = !selectedSessionId ? "hidden lg:flex" : "flex";
          const mobileFull = selectedSessionId ? "fixed inset-0 z-50 w-full h-screen bg-white dark:bg-slate-950" : "";
          const lgReset = "lg:static lg:w-auto lg:h-auto";
          return `${base} ${visibility} ${mobileFull} ${lgReset}`;
        })()}>
          {selectedSessionId ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSessionId}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="h-full flex flex-col"
              >
                <SharedChatWindow
                  sessionId={selectedSessionId}
                  currentUserId={currentUserId}
                  otherParticipantName={chatSessions.find(s => s.id === selectedSessionId)?.patient?.Name || "Patient"}
                  onBack={() => setSelectedSessionId(null)}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50/20 dark:bg-slate-950/10">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-850 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                <MessageSquare size={32} className="text-blue-500/20 dark:text-blue-500/30" />
              </div>
              <h3 className="text-lg font-black text-slate-805 dark:text-white mb-1.5 tracking-tight">Secure Consultation Hub</h3>
              <p className="text-slate-400 dark:text-slate-500 font-semibold max-w-[240px] mx-auto text-xs leading-relaxed">
                Select a patient record from the left panel to begin a secure consultation session.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100/30">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Connection
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-450 rounded-lg text-[9px] font-black uppercase tracking-wider border border-blue-100/30">
                  <Info size={10} />
                  End-to-end Encrypted
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
