import React, { useState, useEffect, useRef } from "react";
import { BsChatRightFill, BsSendFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your AI assistant. How can I help?" },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    function onModalChange(e) {
      setGlobalModalOpen(!!e.detail?.open);
    }
    window.addEventListener('modal:change', onModalChange);
    return () => window.removeEventListener('modal:change', onModalChange);
  }, []);

  const rootStateClass = globalModalOpen ? 'opacity-40 filter blur-sm pointer-events-none' : '';

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Connect to your Laravel API
      const res = await axios.post("http://localhost:8000/api/chat", {
        message: input,
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Connection error. Is Ollama running?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex lg:w-[35%] flex-col items-end ${rootStateClass}`}>
      {/* 1. THE MODAL */}
      {isOpen && (
        <div
          className={`
          flex flex-col bg-white dark:bg-gray-600 shadow-2xl border border-gray-200 dark:border-gray-400 overflow-hidden transition-all duration-300
        
          fixed bottom-0 left-0 right-0 w-full  h-[70vh] rounded-t-3xl
        
          sm:relative sm:bottom-4 sm:right-0 sm:w-80 sm:h-450px sm:rounded-2xl sm:mb-2
        `}
        >
          {/* Header */}
          <div className="bg-blue-600 dark:bg-gray-800 p-4 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <RiRobot2Line className="text-xl" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Chat Support
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 dark:hover:bg-gray-600 p-1 rounded-full transition cursor-pointer"
            >
              <IoClose size={22} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-slate-50 dark:bg-gray-600"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-[13px] shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 dark:bg-gray-700 text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-500 text-gray-700 dark:text-white border border-gray-100 dark:border-gray-400 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-[11px] animate-pulse">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                Thinking...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a message..."
                disabled={globalModalOpen}
                className={`flex-1 bg-gray-100 dark:bg-gray-500 border-none rounded-xl px-4 py-2.5
                 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-700 outline-none dark:text-white ${globalModalOpen ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            <button
                onClick={handleSend}
                disabled={globalModalOpen || !input.trim()}
                className={`text-blue-600 dark:text-white/90 hover:scale-110 disabled:opacity-30 dark:disabled:opacity-45 transition-all p-1 cursor-pointer ${globalModalOpen ? 'pointer-events-none' : ''}`}
            >
              <BsSendFill size={20} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          bg-blue-600 dark:bg-gray-500 hover:bg-blue-700 dark:hover:bg-gray-600 text-white p-2 rounded-full shadow-2xl transition-all 
          active:scale-90 flex items-center justify-center cursor-pointer
          ${isOpen ? "hidden sm:flex" : "flex"} 
        `}
      >
        {isOpen ? (
          <IoClose size={24} className="text-white" />
        ) : (
          <BsChatRightFill size={24} className="text-white m-1" />
        )}
      </button>
    </div>
  );
}
