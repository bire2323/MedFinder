import { ArrowLeft, Loader2, Send, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/UserAuthStore";

import { useTranslation } from "react-i18next";
import useRealtimeChat from "../hooks/useRealtimeChat";
import useChatNotificationStore from "../store/useChatNotificationStore";


export default function SharedChatWindow({ sessionId, currentUserId, otherParticipantName, onBack }) {
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuthStore();
    const { sessions } = useChatNotificationStore();

    const { messages, fetchMessages, sendMessage, sendTyping, isTyping, whoIsTyping, markAsRead, onlineUsers } = useRealtimeChat(sessionId, { currentUserId });

    const session = sessions.find(s => String(s.id) === String(sessionId));
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
        const load = async () => {
            if (!sessionId) return;
            try {
                await fetchMessages(sessionId);
                // Mark session as read immediately on open
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
            <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-900/50 shrink-0">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                        {otherParticipantName?.[0]?.toUpperCase() || <User size={20} />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold truncate text-slate-900 dark:text-white">
                            {otherParticipantName || "Chat Session"}
                        </p>
                        <div className="flex items-center gap-1.5">
                            {onlineUsers.some(id => String(id) !== String(currentUserId)) ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Online</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-gray-600"></span>
                                    <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
                                        Offline • Last seen {formatLastSeen(lastSeenAt || messages?.[messages.length - 1]?.created_at)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-950/40">
                {(!messages || messages.length === 0) ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-600 dark:text-gray-300 italic">
                        No messages yet.
                    </div>
                ) : (
                    messages.map((m, idx) => {
                        const isOwn = String(m?.sender_id ?? "") === String(currentUserId ?? "");
                        const showUnreadDivider = idx === firstUnreadIndex;

                        return (
                            <React.Fragment key={String(m?.id ?? `${m?.created_at ?? ""}-${Math.random()}`)}>
                                {showUnreadDivider && (
                                    <div className="flex items-center gap-4 py-4">
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-gray-700"></div>
                                        <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                                            New Messages
                                        </span>
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-gray-700"></div>
                                    </div>
                                )}

                                <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mb-1 
                                        ${isOwn
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                            : "bg-slate-300 dark:bg-gray-700 text-slate-600 dark:text-gray-300"}`}>
                                        {isOwn ? user?.Name?.[0]?.toUpperCase() : (otherParticipantName?.[0]?.toUpperCase() || "?")}
                                    </div>

                                    <div
                                        className={[
                                            "relative max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            isOwn
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-gray-200 dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-gray-700 rounded-bl-none",
                                        ].join(" ")}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{m?.message ?? ""}</p>
                                        <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${isOwn ? "justify-end text-blue-100" : "justify-start text-slate-400 dark:text-gray-500"}`}>
                                            <span>{formatTime(m?.created_at)}</span>
                                            {isOwn && getStatusIcon(m)}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}

                {isTyping && (
                    <div className="flex items-center gap-2 ml-10">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-[11px] text-slate-500 italic font-medium">{whoIsTyping || 'Someone'} is typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 shrink-0">
                <div className="relative flex items-center gap-2">
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
                        placeholder="Type a message..."
                        className="flex-1 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                        type="button"
                        onClick={sendMessageHandler}
                        disabled={sending || !newMessage.trim()}
                        className="shrink-0 rounded-2xl bg-blue-600 text-white px-4 py-3 font-extrabold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Send message"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
