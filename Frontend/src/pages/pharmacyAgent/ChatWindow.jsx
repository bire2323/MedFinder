import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../../store/UserAuthStore';
import { apiFetch, ensureCsrfCookie } from '../../api/client';

export default function ChatWindow({ sessionId, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [whoIsTyping, setWhoIsTyping] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { user } = useAuthStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await apiFetch(`/api/chat/sessions/${sessionId}/messages`, { method: "GET" });
                // Ensure we always have an array
                const messagesArray = Object.values(data || {});
                setMessages(Array.isArray(messagesArray) ? messagesArray.reverse() : []);
            } catch (err) {
                console.error('Error loading messages:', err);
                setMessages([]); // Reset to empty array on error
            }
        };

        loadMessages();
    }, [sessionId]);

    // Mark messages as read
    const markMessagesAsRead = async () => {
        if (!Array.isArray(messages) || messages.length === 0) return;

        const lastMessageId = messages[messages.length - 1]?.id;
        if (!lastMessageId) return;

        try {
            await ensureCsrfCookie();
            await apiFetch(`/api/chat/sessions/${sessionId}/mark-read`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message_id: lastMessageId }),
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark as read when component mounts and when new messages arrive
    useEffect(() => {
        const timer = setTimeout(markMessagesAsRead, 1000);
        return () => clearTimeout(timer);
    }, [messages, sessionId]);

    // Echo subscription
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.join(`chat.session.${sessionId}`)
            .here((users) => {
                console.log('Online:', users);
                // Just log online users for now
            })
            .joining((user) => {
                console.log(user?.Name || 'User', 'joined');
            })
            .leaving((user) => console.log(user?.Name || 'User', 'left'))
            .listen('.message.sent', (e) => {
                setMessages((prev) => {
                    // Ensure prev is an array
                    const currentMessages = Array.isArray(prev) ? prev : [];

                    // Check for duplicates
                    if (currentMessages.some(m => m?.id === e?.id)) {
                        return currentMessages;
                    }

                    // Add the new message
                    return [...currentMessages, e];
                });
            })
            .listen('.message.read', (e) => {
                setMessages((prev) => {
                    const currentMessages = Array.isArray(prev) ? prev : [];
                    return currentMessages.map(msg => {
                        if (msg?.id === e?.messageId && msg?.sender_id === currentUserId) {
                            return { ...msg, is_read: true };
                        }
                        return msg;
                    });
                });
            });

        return () => {
            window.Echo.leave(`chat.session.${sessionId}`);
        };
    }, [sessionId, currentUserId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        // Clear typing indicator
        if (window.Echo) {
            window.Echo.join(`chat.session.${sessionId}`).whisper('typing', {
                name: user?.Name || 'Someone',
                typing: false,
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ message: newMessage }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        // If input is empty, send typing stopped
        if (!value.trim()) {
            if (window.Echo) {
                window.Echo.join(`chat.session.${sessionId}`).whisper('typing', {
                    name: user?.Name || 'Someone',
                    typing: false,
                });
            }
            return;
        }

        // Debounce typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            if (window.Echo) {
                window.Echo.join(`chat.session.${sessionId}`).whisper('typing', {
                    name: user?.Name || 'Someone',
                    typing: true,
                });
            }
        }, 500);
    };

    // Helper function to get status icon
    const getStatusIcon = (msg) => {
        if (msg.sender_id !== currentUserId) return null;

        if (msg.is_read) {
            return <span className="text-xs text-blue-600">✓✓</span>; // Read
        } else {
            return <span className="text-xs text-gray-500">✓</span>; // Sent
        }
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
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
}