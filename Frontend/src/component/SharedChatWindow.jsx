import { ArrowLeft, Info, Loader2, MessageSquare, Phone, Send, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/UserAuthStore";

import { useTranslation } from "react-i18next";
import useRealtimeChat from "../hooks/useRealtimeChat";
import useChatNotificationStore from "../store/useChatNotificationStore";
import Loading from "./SupportiveComponent/Loading";


export default function SharedChatWindow({ sessionId, currentUserId, otherParticipantName, onBack }) {
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuthStore();
    const { sessions } = useChatNotificationStore();
    const [loading, setLoading] = useState(false);

    const { messages, fetchMessages, sendMessage, sendTyping, isTyping, whoIsTyping, markAsRead, onlineUsers } = useRealtimeChat(sessionId, { currentUserId });
    const session = sessions.find(s => String(s.id) === String(sessionId));
    console.log("sessio", session);
    const otherParticipant = session?.participants?.find(p => String(p.id) !== String(currentUserId));
    const lastSeenAt = otherParticipant?.last_seen_at;

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [sending, setSending] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        const load = async () => {
            if (!sessionId) return;
            try {
                await fetchMessages(sessionId);
                // Mark session as read immediately on open
                setLoading(false);
                markAsRead(sessionId);
            } catch (err) {
                console.error('Error loading messages:', err);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [sessionId, fetchMessages]);

    // Mark messages as read when messages change
    useEffect(() => {
        if (!Array.isArray(messages) || messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;
        if (String(lastMessage.sender_id) !== String(currentUserId) && !lastMessage.is_read) {
            const t = setTimeout(() => {
                markAsRead(sessionId, lastMessage.id);
            }, 800);
            return () => clearTimeout(t);
        }
    }, [messages, sessionId, markAsRead, currentUserId]);

    const sendMessageHandler = async () => {
        if (!newMessage.trim() || !sessionId) return;
        setSending(true);
        // stop typing
        sendTyping({ typing: false, name: user?.Name || 'Someone' });
        try {
            await sendMessage(sessionId, newMessage.trim());
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (!value.trim()) {
            sendTyping({ typing: false, name: user?.Name || 'Someone' });
            return;
        }

        sendTyping({ typing: true, name: user?.Name || 'Someone' });

        typingTimeoutRef.current = setTimeout(() => {
            sendTyping({ typing: false, name: user?.Name || 'Someone' });
        }, 800);
    };

    const formatTime = (iso) => {
        if (!iso) return "";
        try {
            return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    };

    const formatLastSeen = (iso) => {
        if (!iso) return "Never";
        try {
            console.log(iso);
            const date = new Date(iso);
            const now = new Date();
            const diffMs = now - date;
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            const diffWeeks = Math.floor(diffDays / 7);
            const diffMonths = Math.floor(diffDays / 30);

            if (diffSeconds < 60) return "Just now";
            if (diffMins < 60) return `${diffMins}m ago`;

            // Within 12 hours, show hours
            if (diffHours < 12) return `${diffHours}h ago`;

            // Above 12 hours and less than 48 hours (approx 2 days), show days
            if (diffDays < 1) return "1 day ago"; // This handles the 12h-24h range as requested
            if (diffDays < 7) return `${diffDays + 1} days ago`;

            if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
            if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

            return date.toLocaleDateString();
        } catch {
            return "Unknown";
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (msg) => {
        if (String(msg.sender_id) !== String(currentUserId)) return null;
        if (msg.is_read) return <span className="text-[10px] text-blue-200 ml-1">✓✓</span>;
        return <span className="text-[10px] text-blue-200/50 ml-1">✓</span>;
    };

    const findFirstUnreadIndex = () => {
        if (!messages) return -1;
        return messages.findIndex(m => String(m.sender_id) !== String(currentUserId) && !m.is_read);
    };

    const firstUnreadIndex = findFirstUnreadIndex();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800/40">
            {/* Header for Mobile/Shared Context */}
            <div className="p-5 lg:p-6 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shrink-0 z-20">
                <div className="flex items-center gap-4 min-w-0">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="lg:hidden p-3 -ml-2 rounded-2xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="relative group">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:rotate-3 transition-transform">
                                {otherParticipantName?.[0]?.toUpperCase() || <User size={24} />}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${onlineUsers.some(id => String(id) !== String(currentUserId)) ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-base lg:text-lg font-black truncate text-slate-800 dark:text-white tracking-tight">
                                {otherParticipantName || "Secure Session"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${onlineUsers.some(id => String(id) !== String(currentUserId)) ? "text-emerald-500" : "text-slate-400"}`}>
                                    {onlineUsers.some(id => String(id) !== String(currentUserId)) ? "Active Now" : `Offline • ${formatLastSeen(lastSeenAt || messages?.[messages.length - 1]?.created_at)}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="hidden sm:flex p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-2xl transition-all">
                        <Phone size={18} />
                    </button>
                    <button className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-2xl transition-all">
                        <Info size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-50 dark:bg-gray-950/20 custom-scrollbar">
                {
                    loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Session</p>
                        </div>
                    ) : (
                        messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                                <div className="w-20 h-20 bg-slate-200 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mb-4">
                                    <MessageSquare size={32} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Encrypted channel opened. Say hello!</p>
                            </div>

                        ) : (
                            messages.map((m, idx) => {
                                const isOwn = String(m?.sender_id ?? "") === String(currentUserId ?? "");
                                const showUnreadDivider = idx === firstUnreadIndex;

                                return (
                                    <React.Fragment key={String(m?.id ?? `${m?.created_at ?? ""}-${Math.random()}`)}>
                                        {showUnreadDivider && (
                                            <div className="flex items-center gap-4 py-6">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-50 dark:bg-blue-900/20 px-4 py-1 rounded-full">
                                                    New Messages
                                                </span>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                                            </div>
                                        )}

                                        <div className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                            {/* Avatar minimized */}
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 mb-1 shadow-sm
                                        ${isOwn
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white dark:bg-gray-700 text-slate-500 dark:text-gray-300 border border-slate-100 dark:border-gray-600"}`}>
                                                {isOwn ? user?.Name?.[0]?.toUpperCase() : (otherParticipantName?.[0]?.toUpperCase() || "?")}
                                            </div>

                                            <div
                                                className={[
                                                    "relative max-w-[85%] lg:max-w-[70%] px-5 py-4 rounded-[1.8rem] text-sm leading-relaxed shadow-sm transition-all duration-300 group",
                                                    isOwn
                                                        ? "bg-blue-600 text-white rounded-br-none hover:shadow-lg hover:shadow-blue-500/20"
                                                        : "bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-gray-700 rounded-bl-none hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20",
                                                ].join(" ")}
                                            >
                                                <p className="whitespace-pre-wrap break-words font-medium">{m?.message ?? ""}</p>
                                                <div className={`mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isOwn ? "justify-end text-blue-100" : "justify-start text-slate-400 dark:text-gray-500"}`}>
                                                    <span>{formatTime(m?.created_at)}</span>
                                                    {isOwn && getStatusIcon(m)}
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )
                    )
                }


                {isTyping && (
                    <div className="flex items-center gap-3 ml-12">
                        <div className="flex gap-1 p-2 bg-white dark:bg-gray-800 rounded-full border border-slate-100 dark:border-gray-700 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest leading-none">{whoIsTyping || 'Someone'} is typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 lg:p-8 border-t border-slate-100 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shrink-0">
                <div className="relative flex items-center gap-3 max-w-5xl mx-auto">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessageHandler();
                                }
                            }}
                            placeholder="Type a secure message..."
                            className="w-full rounded-[1.8rem] bg-slate-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-gray-900 px-6 py-4 outline-none transition-all font-bold text-sm shadow-inner"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="hidden sm:inline text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-gray-700 px-2 py-1 rounded-md uppercase">Enter to send</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={sendMessageHandler}
                        disabled={sending || !newMessage.trim()}
                        className="shrink-0 w-14 h-14 rounded-[1.5rem] bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Send message"
                    >
                        {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                    </button>
                </div>
                <p className="mt-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-50">Private medical consultation • MedFinder Hub</p>
            </div>
        </div>
    );
}
