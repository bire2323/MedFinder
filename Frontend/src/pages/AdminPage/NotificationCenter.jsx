import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { getNotifications, markNotificationRead, deleteOldNotifications } from '../../api/admin';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/UserAuthStore';
import { useTranslation } from 'react-i18next';
import Loading from '../../component/SupportiveComponent/Loading';
import useSystemNotificationStore from '../../store/useSystemNotificationStore';
import { useOutletContext } from 'react-router-dom';

function getNotificationIcon(type) {
  switch (type) {
    case 'approval':
      return <CheckCircle className="size-5 text-blue-600 dark:text-blue-400" />;
    case 'violation':
      return <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />;
    case 'update':
      return <Info className="size-5 text-emerald-600 dark:text-emerald-400" />;
    case 'inactive':
      return <XCircle className="size-5 text-orange-600 dark:text-orange-450" />;
    default:
      return <Bell className="size-5 text-slate-500 dark:text-slate-400" />;
  }
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-955/20 dark:border-red-900/40 dark:text-red-400';
    case 'medium':
      return 'bg-indigo-50 text-indigo-705 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400';
    case 'low':
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 23 } }
};

export default function NotificationCenter() {
  const { loadNotifications: onNotificationRead } = useOutletContext();
  const { t } = useTranslation();
  const { notifications, setNotifications, markAsRead: storeMarkAsRead } = useSystemNotificationStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications(user);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setNotifications(list);
      if (typeof onNotificationRead === 'function') onNotificationRead();
    } catch (err) {
      toast.error(t("Admin.toast.failedLoadNotifications"));
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(user, notificationId);
      storeMarkAsRead(notificationId);
      if (typeof onNotificationRead === 'function') onNotificationRead();
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error(t("Admin.toast.failedMarkRead"));
    }
  };

  const handleDeleteOld = async (e) => {
    const duration = e.target.value;
    if (!duration) return;

    if (!window.confirm(t("Admin.ConfirmDeleteOldNotifications", "Are you sure you want to delete read notifications older than the selected duration?"))) {
      e.target.value = "";
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteOldNotifications(user, duration);
      toast.success(res?.message || t("Admin.SuccessDeleteNotifications", "Old notifications deleted successfully"));
      loadNotifications();
    } catch (err) {
      console.error('Failed to delete old notifications:', err);
      toast.error(t("Admin.toast.failedDeleteNotifications", "Failed to delete old notifications"));
    } finally {
      setIsDeleting(false);
      e.target.value = "";
    }
  };

  const isRead = (n) => !!n.read_at || n.read === true;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !isRead(n);
    return (n.priority || '').toLowerCase() === filter;
  });

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white uppercase tracking-wider">{t("Admin.NotificationCenter")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("Admin.NotificationDesc")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <select
            onChange={handleDeleteOld}
            disabled={isDeleting}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20 text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400 focus:ring-2 focus:ring-red-500 outline-none transition cursor-pointer hover:bg-red-100/60 dark:hover:bg-red-950/40 disabled:opacity-50"
            defaultValue=""
          >
            <option value="" disabled>{isDeleting ? t("Common.Deleting", "Deleting...") : t("Admin.DeleteOldNotifications", "Delete Old Notifications")}</option>
            <option value="7_days">{t("Admin.OlderThan7Days", "Older than 7 days")}</option>
            <option value="30_days">{t("Admin.OlderThan30Days", "Older than 30 days")}</option>
            <option value="6_months">{t("Admin.OlderThan6Months", "Older than 6 months")}</option>
            <option value="1_year">{t("Admin.OlderThan1Year", "Older than 1 year")}</option>
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-teal-500 outline-none transition shadow-sm"
          >
            <option value="all">{t("Admin.AllNotifications")}</option>
            <option value="unread">{t("Admin.UnreadOnly")}</option>
            <option value="high">{t("Admin.HighPriority")}</option>
            <option value="medium">{t("Admin.MediumPriority")}</option>
            <option value="low">{t("Admin.LowPriority")}</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">{t("Common.Total")}</p>
              <p className="text-2xl font-black text-slate-850 dark:text-white mt-1 leading-none">{notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 shrink-0">
              <Bell className="size-5" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">{t("Admin.Unread")}</p>
              <p className="text-2xl font-black text-slate-850 dark:text-white mt-1 leading-none">{notifications.filter((n) => !isRead(n)).length}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">{t("Admin.HighPriority")}</p>
              <p className="text-2xl font-black text-slate-850 dark:text-white mt-1 leading-none">
                {notifications.filter((n) => (n.priority || '').toLowerCase() === 'high').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-955/30 rounded-xl border border-red-100 dark:border-red-900/30 text-red-750 dark:text-red-400 shrink-0 animate-pulse">
              <XCircle className="size-5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notifications List */}
      <AnimatePresence mode="popLayout">
        {filteredNotifications.length === 0 ? (
          <motion.div 
            key="empty"
            variants={cardVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 py-16 text-center shadow-sm"
          >
            <div className="size-14 bg-slate-50 dark:bg-slate-955 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
              <Bell className="size-7 text-slate-350 dark:text-slate-600" />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{t("Admin.NoNotifications")}</p>
            <p className="text-sm text-slate-500 dark:text-slate-450">
              {filter === 'unread' ? t("Admin.CaughtUp") : t("Admin.NoMatchFilter")}
            </p>
          </motion.div>
        ) : (
          <motion.div key="list" className="space-y-3.5">
            {filteredNotifications.map((notification) => {
              const read = isRead(notification);
              const timestamp = notification.created_at || notification.timestamp;
              return (
                <motion.div
                  key={notification.id}
                  variants={cardVariants}
                  whileHover={{ x: 2, scale: 1.002, boxShadow: "0 8px 20px -10px rgba(0,0,0,0.05)" }}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm ${!read
                    ? 'border-l-[3px] border-l-teal-500 dark:border-l-teal-500 border-slate-200 dark:border-slate-800'
                    : 'border-slate-200/60 dark:border-slate-800'
                    }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-850 dark:text-white leading-tight">{notification.title}</h3>
                            {!read && (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250 uppercase tracking-wider">
                                {t("Common.New")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                            {notification.message}
                          </p>
                          {timestamp && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">
                              {new Date(timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {notification.priority && (
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getPriorityBadgeClass(notification.priority)}`}>
                            {notification.priority === 'high' ? t("Admin.HighPriority") : notification.priority === 'medium' ? t("Admin.MediumPriority") : t("Admin.LowPriority")}
                          </span>
                        )}
                        {!read && (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            {t("Admin.MarkAsRead")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
