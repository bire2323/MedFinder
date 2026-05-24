import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquare, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from "react-router-dom";
import SharedChatWindow from "../../../component/SharedChatWindow";
import { apiFetch } from "../../../api/client";
import useChatNotificationStore from "../../../store/useChatNotificationStore";

export default function ChatsTab() {
    const { currentUserId } = useOutletContext();
    const { t } = useTranslation();
    const { sessions: chatSessions, loadSessions, activeSessionId: selectedSessionId, setActiveSessionId: setSelectedSessionId, targetSessionToOpen, setTargetSessionToOpen } = useChatNotificationStore();
    const [loadingChats, setLoadingChats] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const listVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div
            key="chats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 flex flex-col h-full"
        >
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                        {t("PharmacyDashboard.ChatWithPatients")}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        Connect and assist patients seeking medications online
                    </p>
                </div>
                {chatSessions.length > 0 && (
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/10">
                        {chatSessions.length === 1 ? t("Common.ActiveChat") : t("Common.ActiveChats", { count: chatSessions.length })}
                    </span>
                )}
            </div>

            {loadingChats ? (
                <div className="flex justify-center items-center h-80">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                </div>
            ) : chatSessions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-12 text-center shadow-sm shadow-slate-100/50 dark:shadow-none">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-600" />
                    <h3 className="mt-4 text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        {t("PharmacyDashboard.NoActiveChats")}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-550 max-w-xs mx-auto leading-relaxed">
                        {t("PharmacyDashboard.NoChatsDesc")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                    {/* Chat list */}
                    <div className={`lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden flex flex-col shadow-sm shadow-slate-100/50 dark:shadow-none ${selectedSessionId ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
                            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest">{t("Common.Conversations")}</h3>
                        </div>
                        <motion.div 
                            variants={listVariants}
                            initial="hidden"
                            animate="show"
                            className="flex-1 overflow-y-auto max-h-[60vh] divide-y divide-slate-50 dark:divide-slate-800/30 no-scrollbar"
                        >
                            {chatSessions.map((session) => (
                                <motion.button
                                    key={session.id}
                                    variants={itemVariants}
                                    onClick={() => {
                                        setSelectedSessionId(session.id);
                                    }}
                                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300 relative group cursor-pointer ${
                                        selectedSessionId === session.id 
                                            ? 'bg-gradient-to-r from-emerald-500/5 to-transparent text-slate-900 dark:text-white border-l-4 border-emerald-500' 
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                            {session.patient?.Name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors">
                                                {session.patient?.Name || t("Common.Patient")}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-550 truncate mt-0.5 font-medium">
                                                {session.last_message?.message || session.last_message || t("Chat.no_messages")}
                                            </p>
                                        </div>
                                        {session.unread_count > 0 && (
                                            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                                                {session.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>

                    {/* Chat window */}
                    <div className={`lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden relative min-h-[500px] shadow-sm shadow-slate-100/50 dark:shadow-none ${!selectedSessionId ? 'hidden lg:block' : 'block'}`}>
                        {selectedSessionId ? (
                          <div className="h-full flex flex-col w-full absolute inset-0">
                                <SharedChatWindow
                                    sessionId={selectedSessionId}
                                    currentUserId={currentUserId}
                                    otherParticipantName={chatSessions.find(s => s.id === selectedSessionId)?.patient?.Name || t("Common.Patient")}
                                    onBack={() => setSelectedSessionId(null)}
                                />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center p-8">
                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-650 mb-4" />
                                    <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
                                        {t("PharmacyDashboard.SelectAConversation")}
                                    </h3>
                                    <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-550 max-w-xs mx-auto leading-relaxed">
                                        {t("PharmacyDashboard.ClickToStart")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
