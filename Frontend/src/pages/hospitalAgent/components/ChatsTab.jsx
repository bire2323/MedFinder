import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquare, Search, ChevronLeft, User, Phone, Info } from "lucide-react";
import SharedChatWindow from "../../../component/SharedChatWindow";
import useChatNotificationStore from "../../../store/useChatNotificationStore";

import { useOutletContext } from "react-router-dom";

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

  useEffect(() => {
    if (targetSessionToOpen) {
      setSelectedSessionId(targetSessionToOpen);
      setTargetSessionToOpen(null);
    }
  }, [targetSessionToOpen, setTargetSessionToOpen, setSelectedSessionId]);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-220px)] bg-white dark:bg-gray-800/50 rounded-[2.5rem] border border-slate-200 dark:border-gray-700 overflow-hidden shadow-2xl shadow-blue-500/5"
    >
      <div className="flex h-full relative">
        {/* Chat list */}
        <div
          className={`w-full lg:w-[380px] border-r border-slate-100 dark:border-gray-700 flex flex-col bg-slate-50/50 dark:bg-gray-900/20 transition-all duration-300 ${selectedSessionId ? "hidden lg:flex" : "flex"
            }`}
        >
          <div className="p-6 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-200 hover:scale-105 transition-transform"
                  aria-label="Back"
                >
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Conversations</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {chatSessions.length} active
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
            {loadingChats ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loading Encrypted Chats</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                  <MessageSquare size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-400">No conversations found</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full group p-4 rounded-3xl text-left transition-all duration-300 relative ${selectedSessionId === session.id
                      ? "bg-white dark:bg-gray-800 shadow-xl shadow-blue-500/10 scale-[1.02] z-10"
                      : "hover:bg-white/50 dark:hover:bg-gray-800/30"
                    }`}
                >
                  {selectedSessionId === session.id && (
                    <motion.div
                      layoutId="active-chat"
                      className="absolute inset-y-4 left-0 w-1 bg-blue-500 rounded-full"
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform duration-300 group-hover:scale-105 shadow-sm ${selectedSessionId === session.id
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                        }`}>
                        {session.patient?.Name?.[0]?.toUpperCase() || <User size={20} />}
                      </div>
                      {session.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-lg animate-bounce">
                          {session.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-black text-slate-800 dark:text-white truncate tracking-tight text-sm">
                          {session.patient?.Name || "Patient"}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {session.last_message_at ? new Date(session.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${session.unread_count > 0 ? "font-black text-blue-600 dark:text-blue-400" : "font-medium text-slate-500 dark:text-gray-400"}`}>
                        {session.last_message?.message || session.last_message || "Start messaging..."}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window container: on small screens when a session is selected make it fixed/fullscreen */}
        <div className={(() => {
          const base = "flex-1 flex flex-col bg-white dark:bg-gray-900/20 h-full overflow-hidden transition-all duration-500";
          const visibility = !selectedSessionId ? "hidden lg:flex" : "flex";
          const mobileFull = selectedSessionId ? "fixed inset-0 z-50 w-full h-screen bg-white dark:bg-gray-900/90" : "";
          const lgReset = "lg:static lg:w-auto lg:h-auto";
          return `${base} ${visibility} ${mobileFull} ${lgReset}`;
        })()}>
          {selectedSessionId ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSessionId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/30 dark:bg-gray-900/10">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/5 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                <MessageSquare size={40} className="text-blue-500/30" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Secure Consultation Hub</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Select a patient record from the left panel to begin a secure consultation session.
              </p>
              <div className="mt-8 flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Connection
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                  <Info size={12} />
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
