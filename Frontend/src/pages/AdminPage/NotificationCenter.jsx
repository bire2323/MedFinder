import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../api/admin';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/UserAuthStore';
import { useTranslation } from 'react-i18next';
import Loading from '../../component/SupportiveComponent/Loading';
import useSystemNotificationStore from '../../store/useSystemNotificationStore';

function getNotificationIcon(type) {
  switch (type) {
    case 'approval':
      return <CheckCircle className="size-5 text-blue-600 dark:text-blue-400" />;
    case 'violation':
      return <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />;
    case 'update':
      return <Info className="size-5 text-emerald-600 dark:text-emerald-400" />;
    case 'inactive':
      return <XCircle className="size-5 text-orange-600 dark:text-orange-400" />;
    default:
      return <Bell className="size-5 text-slate-500 dark:text-gray-400" />;
  }
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    case 'medium':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
    case 'low':
      return 'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300';
  }
}

import { useOutletContext } from 'react-router-dom';

export default function NotificationCenter() {
  const { loadNotifications: onNotificationRead } = useOutletContext();
  const { t } = useTranslation();
  const { notifications, setNotifications, markAsRead: storeMarkAsRead } = useSystemNotificationStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Admin.NotificationCenter")}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            {t("Admin.NotificationDesc")}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-slate-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
        >
          <option value="all">{t("Admin.AllNotifications")}</option>
          <option value="unread">{t("Admin.UnreadOnly")}</option>
          <option value="high">{t("Admin.HighPriority")}</option>
          <option value="medium">{t("Admin.MediumPriority")}</option>
          <option value="low">{t("Admin.LowPriority")}</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Common.Total")}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{notifications.length}</p>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Bell className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.Unread")}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{notifications.filter((n) => !isRead(n)).length}</p>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.HighPriority")}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {notifications.filter((n) => (n.priority || '').toLowerCase() === 'high').length}
              </p>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <XCircle className="size-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 py-16 text-center">
          <div className="size-14 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="size-7 text-slate-300 dark:text-gray-600" />
          </div>
          <p className="text-lg font-bold text-slate-700 dark:text-gray-200 mb-1">{t("Admin.NoNotifications")}</p>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            {filter === 'unread' ? t("Admin.CaughtUp") : t("Admin.NoMatchFilter")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const read = isRead(notification);
            const timestamp = notification.created_at || notification.timestamp;
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-sm ${!read
                  ? 'border-l-[3px] border-l-indigo-500 dark:border-l-indigo-400 border-slate-200'
                  : 'border-slate-200'
                  }`}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-slate-50 dark:bg-gray-800">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</h3>
                          {!read && (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase tracking-wide">
                              {t("Common.New")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                          {notification.message}
                        </p>
                        {timestamp && (
                          <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">
                            {new Date(timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {notification.priority && (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${getPriorityBadgeClass(notification.priority)}`}>
                          {notification.priority === 'high' ? t("Admin.HighPriority") : notification.priority === 'medium' ? t("Admin.MediumPriority") : t("Admin.LowPriority")}
                        </span>
                      )}
                      {!read && (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          {t("Admin.MarkAsRead")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
