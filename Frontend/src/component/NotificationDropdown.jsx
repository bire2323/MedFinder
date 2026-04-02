import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, X, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useSystemNotificationStore from '../store/useSystemNotificationStore';
import { markNotificationRead, getNotifications } from '../api/admin';
import useAuthStore from '../store/UserAuthStore';
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { notifications, setNotifications, markAsRead } = useSystemNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && notifications.length === 0) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications(user);
      const data = Array.isArray(response) ? response : response?.data || [];
      // Filter for current user since backend might return all (fixing the issue client-side for now)
      const userNotifications = data.filter(n => !n.user_id || n.user_id === user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
        await markNotificationRead(user, id);
        markAsRead(id);
    } catch (error) {
        console.error("Failed to mark read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'approved':
      case 'approval': return <CheckCircle className="size-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="size-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="size-5 text-amber-500" />;
      default: return <Info className="size-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-all group"
        aria-label="Toggle notifications"
      >
        <Bell size={24} className={isOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-gray-400 group-hover:scale-110 transition-transform"} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800 animate-in fade-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {t('HospitalDashboard.Notifications')}
                {unreadCount > 0 && <span className="text-xs font-normal text-slate-400">({unreadCount} new)</span>}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-gray-700">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={32} className="text-slate-300 dark:text-gray-500" />
                  </div>
                  <p className="text-slate-500 dark:text-gray-400 font-medium">No system notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-gray-700">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-gray-750 transition-colors relative group ${!n.read_at ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1 shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${!n.read_at ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 flex items-center gap-1.5">
                            <Info size={10} />
                            {new Date(n.created_at || n.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!n.read_at && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="shrink-0 p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 dark:border-gray-700 bg-slate-50/30 dark:bg-gray-800/30">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Close panel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
