import React, { useState, useEffect, useRef } from "react";
import { BsChatRightFill, BsSendFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import { sendMessage } from "../api/ChatBot";
import { useTranslation } from "react-i18next";

export default function FloatingChatButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: t("floatingChat.greeting"), buttons: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);
  const handleButtonClick = (payload) => {
    setInput(payload.intent);
    setTimeout(() => {
      handleSend();
    }, 100);
  };
  useEffect(() => {
    function onModalChange(e) {
      setGlobalModalOpen(!!e.detail?.open);
    }
    window.addEventListener('modal:change', onModalChange);
    return () => window.removeEventListener('modal:change', onModalChange);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = {
      role: "user", text: input, buttons: []
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(input);

      if (data && data.length > 0) {
        // Map all responses from the array
        const botMessages = data.map(msg => ({
          role: "bot",
          text: msg.text,
          buttons: msg.buttons || []
        }));

        setMessages((prev) => [...prev, ...botMessages]);
      } else {
        // Handle empty response from Rasa
        setMessages((prev) => [...prev, { role: "bot", text: "..." }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t("floatingChat.connectionError") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const rootStateClass = globalModalOpen ? 'opacity-40 filter blur-sm pointer-events-none' : '';

  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex flex-col items-end transition-all duration-300 ${rootStateClass}`}>

      {/* 1. THE CHAT WINDOW */}
      {isOpen && (
        <div
          className="flex flex-col bg-white dark:bg-gray-900 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-gray-700 overflow-hidden transition-all duration-500 ease-in-out
          fixed bottom-0 left-0 right-0 w-full h-[80vh] rounded-t-[2.5rem]
          sm:relative sm:bottom-4 sm:w-[380px] sm:h-[550px] sm:rounded-3xl sm:mb-4"
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 p-5 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <RiRobot2Line className="text-2xl" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">{t("floatingChat.title")}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-medium opacity-80">{t("floatingChat.onlineReady")}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            >
              <IoClose size={20} />
            </button>
          </div>

          {console.log(messages)}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-gray-950 no-scrollbar"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} >
                <div style={{ whiteSpace: "pre-line" }}
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all
                    ${msg.role === "user"
                      ? "bg-blue-600 dark:bg-blue-700 text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-100 dark:border-gray-700 rounded-tl-none"
                    }`}
                >
                  {msg.text}
                  {msg.buttons?.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      {msg.buttons.map((btn, i) => (
                        <button
                          key={i}
                          onClick={() => handleButtonClick(btn.payload)}
                          className="flex flex-wrap mx-0 my-5 px-2 py-1 bg-slate-200 dark:bg-gray-700 rounded-xl cursor-pointer"
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
          < div className="p-4 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800" >
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
                className="bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <BsSendFill size={16} />
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* 2. THE FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative group overflow-hidden bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 text-white w-16 h-16 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-300
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
    </div >
  );
}