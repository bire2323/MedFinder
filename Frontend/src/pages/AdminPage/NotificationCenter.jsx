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

function getNotificationIcon(type) {
  switch (type) {
    case 'approval':
      return <CheckCircle className="size-5 text-blue-600 dark:text-blue-400" />;
    case 'violation':
      return <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />;
    case 'update':
      return <Info className="size-5 text-green-600 dark:text-green-400" />;
    case 'inactive':
      return <XCircle className="size-5 text-orange-600 dark:text-orange-400" />;
    default:
      return <Bell className="size-5 text-gray-600 dark:text-gray-400" />;
  }
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
    case 'medium':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200';
    case 'low':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

export default function NotificationCenter({ onNotificationRead, token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (token) loadNotifications();
  }, [token]);

  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getNotifications(token);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setNotifications(list);
      if (typeof onNotificationRead === 'function') onNotificationRead();
    } catch (err) {
      toast.error('Failed to load notifications');
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!token) return;
    try {
      await markNotificationRead(token, notificationId);
      loadNotifications();
      if (typeof onNotificationRead === 'function') onNotificationRead();
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Failed to mark as read');
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
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Notification Center</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Stay updated with system alerts and pending actions
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread Only</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold">{notifications.length}</p>
            </div>
            <Bell className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-semibold">{notifications.filter((n) => !isRead(n)).length}</p>
            </div>
            <AlertTriangle className="size-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-semibold">
                {notifications.filter((n) => (n.priority || '').toLowerCase() === 'high').length}
              </p>
            </div>
            <XCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-12 text-center">
          <Bell className="size-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium mb-2">No notifications</p>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unread'
              ? "You're all caught up!"
              : 'No notifications match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const read = isRead(notification);
            const timestamp = notification.created_at || notification.timestamp;
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden ${
                  !read ? 'border-l-4 border-l-indigo-600 dark:border-l-indigo-400' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 shrink-0">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold">{notification.title}</h3>
                          {!read && (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {notification.message}
                        </p>
                        {timestamp && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {notification.priority && (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityBadgeClass(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                      )}
                      {!read && (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
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
