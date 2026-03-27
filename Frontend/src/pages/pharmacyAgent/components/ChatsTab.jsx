import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import SharedChatWindow from "../../../component/SharedChatWindow";
import { apiFetch } from "../../../api/client";
import useChatNotificationStore from "../../../store/useChatNotificationStore";

export default function ChatsTab({ currentUserId }) {
    const { t } = useTranslation();
    const { sessions: chatSessions, loadSessions, activeSessionId: selectedSessionId, setActiveSessionId: setSelectedSessionId, targetSessionToOpen, setTargetSessionToOpen } = useChatNotificationStore();
    const [loadingChats, setLoadingChats] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            key="chats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2 flex flex-col h-full"
        >
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold">{t("PharmacyDashboard.ChatWithPatients")}</h2>
                {chatSessions.length > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {chatSessions.length === 1 ? t("Common.ActiveChat") : t("Common.ActiveChats", { count: chatSessions.length })}
                    </span>
                )}
            </div>

            {loadingChats ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            ) : chatSessions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t("PharmacyDashboard.NoActiveChats")}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t("PharmacyDashboard.NoChatsDesc")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-6 flex-1 min-h-[500px]">
                    {/* Chat list */}
                    <div className={`lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${selectedSessionId ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                            <h3 className="font-semibold">{t("Common.Conversations")}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[60vh]">
                            {chatSessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => {
                                        setSelectedSessionId(session.id);
                                    }}
                                    className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${selectedSessionId === session.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 font-medium shrink-0">
                                            {session.patient?.Name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {session.patient?.Name || t("Common.Patient")}
                                            </p>
                                            <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">


                                                {session.last_message?.message || session.last_message || t("Chat.no_messages")}
                                            </p>
                                        </div>
                                        {session.unread_count > 0 && (
                                            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shrink-0">
                                                {session.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat window */}
                    <div className={`lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative min-h-[500px] ${!selectedSessionId ? 'hidden lg:block' : 'block'}`}>
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
                                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {t("PharmacyDashboard.SelectAConversation")}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
