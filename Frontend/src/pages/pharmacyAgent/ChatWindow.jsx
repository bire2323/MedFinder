import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../../store/UserAuthStore';
import useRealtimeChat from '../../hooks/useRealtimeChat';

export default function ChatWindow({ sessionId, currentUserId }) {
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuthStore();

    const { messages, fetchMessages, sendMessage, sendTyping, isTyping, whoIsTyping, markAsRead } = useRealtimeChat(sessionId, { currentUserId });

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);


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
        const lastMessageId = messages[messages.length - 1]?.id;
        if (!lastMessageId) return;
        const t = setTimeout(() => {
            markAsRead(sessionId, lastMessageId);
        }, 800);
        return () => clearTimeout(t);
    }, [messages, sessionId, markAsRead]);

    // Real-time subscription and typing handled in useRealtimeChat

    const sendMessageHandler = async () => {
        if (!newMessage.trim()) return;
        // stop typing
        sendTyping(sessionId, { typing: false, name: user?.Name || 'Someone' });
        try {
            await sendMessage(sessionId, newMessage.trim());
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        // Debounce: send typing started immediately, send typing stopped after 800ms inactivity
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (!value.trim()) {
            sendTyping(sessionId, { typing: false, name: user?.Name || 'Someone' });
            return;
        }

        // notify typing started
        sendTyping(sessionId, { typing: true, name: user?.Name || 'Someone' });

        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(sessionId, { typing: false, name: user?.Name || 'Someone' });
        }, 800);
    };

    // Helper function to get status icon
    const getStatusIcon = (msg) => {
        if (msg.sender_id !== currentUserId) return null;
        if (msg.is_read) return <span className="text-xs text-blue-600">✓✓</span>;
        return <span className="text-xs text-gray-500">✓</span>;
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] border-gray-200 border rounded-lg shadow-sm bg-white">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {Array.isArray(messages) && messages?.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-xl ${isOwn ? 'bg-blue-200 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.message}</p>
                                <span className="text-xs opacity-70 block mt-1 flex items-center gap-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {getStatusIcon(msg)}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="text-gray-500 text-sm italic">
                        {whoIsTyping || 'Someone'} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessageHandler())}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessageHandler}
                    disabled={!newMessage.trim()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
}