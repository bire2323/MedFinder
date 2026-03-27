import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, XCircle } from 'lucide-react';
import useSystemNotificationStore from '../store/useSystemNotificationStore';

export default function SystemNotificationToast() {
  const { latestNotification, clearLatestNotification } = useSystemNotificationStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => clearLatestNotification(), 300);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification, clearLatestNotification]);

  if (!latestNotification) return null;

  const isSuccess = latestNotification.type === 'approved';
  const isError = latestNotification.type === 'rejected';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[60] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/80 transition-colors"
          onClick={() => {
              setIsVisible(false);
              setTimeout(() => clearLatestNotification(), 300);
          }}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 
                isError ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
                'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
            }`}>
              {isSuccess ? <CheckCircle size={20} /> : isError ? <XCircle size={20} /> : <Bell size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {latestNotification.title}
              </p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 line-clamp-2">
                {latestNotification.message}
              </p>
            </div>
            <button
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setTimeout(() => clearLatestNotification(), 300);
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
