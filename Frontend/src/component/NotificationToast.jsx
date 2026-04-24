import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import useChatNotificationStore from '../store/useChatNotificationStore';
import { useTranslation } from 'react-i18next';

export default function NotificationToast() {
  const { t } = useTranslation();
  const { latestMessage, clearLatestMessage, setTargetSessionToOpen } = useChatNotificationStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestMessage) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => clearLatestMessage(), 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestMessage, clearLatestMessage]);

  const handleToastClick = () => {
    if (latestMessage?.sessionId) {
      setTargetSessionToOpen(latestMessage.sessionId);
    }
    setIsVisible(false);
    setTimeout(() => clearLatestMessage(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && latestMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-20 right-4 sm:top-24 sm:right-8 z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-emerald-100 dark:border-emerald-900/50 p-4 max-w-sm w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/80 transition-colors"
          onClick={handleToastClick}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {latestMessage.senderName || t('notification.newMessage')}
              </p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 line-clamp-2">
                {latestMessage.message}
              </p>
            </div>
            <button
              className="shrink-0 text-slate-200 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setTimeout(() => clearLatestMessage(), 300);
              }}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
