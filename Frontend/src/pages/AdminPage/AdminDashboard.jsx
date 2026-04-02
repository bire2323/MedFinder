import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckCircle,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/UserAuthStore';
import { getNotifications } from '../../api/admin';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import ApprovalManagement from './ApprovalManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import NotificationCenter from './NotificationCenter';
import { useRef } from 'react';
import useSystemNotificationStore from '../../store/useSystemNotificationStore';
import { initializeAuth } from '../../auth/initAuth';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadStats();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      const unread = list.filter((n) => !n.read_at).length;
      setUnreadNotifications(unread);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };


  useEffect(() => {
    // Rely on global RealTimeNotificationProvider to update the store
    // Here we just pull from store to update local counters if needed
  }, []);
  useEffect(() => {
    const init = async () => {
      const isAuthentic = await initializeAuth();
      //console.log(isAuthentic);
      if (!isAuthentic) {
        navigate("/");
      }
    };

    init();
  }, [isAuthenticated])
  const { latestNotification } = useSystemNotificationStore();
  useEffect(() => {
    if (latestNotification && latestNotification.type === 'approval') {
      setUnreadNotifications(prev => prev + 1);
    }
  }, [latestNotification]);

  const loadStats = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { getSystemStats, getAllUsers, getPendingApprovals } = await import('../../api/admin');
      const [statsRes, usersRes, approvalsRes] = await Promise.all([
        getSystemStats().catch(() => null),
        getAllUsers().catch(() => []),
        getPendingApprovals().catch(() => []),
      ]);
      const users = Array.isArray(usersRes) ? usersRes : [];
      const approvals = Array.isArray(approvalsRes) ? approvalsRes : [];
      setStats({
        totalUsers: statsRes?.total_users ?? users.length,
        totalHospitals: statsRes?.total_hospitals ?? 0,
        totalPharmacies: statsRes?.total_pharmacies ?? 0,
        pendingApprovals: approvals.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-green dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <Shield className="size-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold">{t("Admin.AdminDashboard")}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  {t("Admin.PlatformManagement")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                className="relative p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setActiveTab('notifications')}
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Desktop Tabs */}
        <div className="hidden lg:flex w-full justify-start bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 gap-1">
          {[
            { id: 'overview', label: t("Admin.Overview"), icon: BarChart3 },
            { id: 'users', label: t("Admin.UserManagement"), icon: Users },
            { id: 'approvals', label: t("Admin.Approvals"), icon: CheckCircle },
            { id: 'analytics', label: t("Admin.Analytics"), icon: BarChart3 },
            { id: 'notifications', label: t("Admin.Notifications"), icon: Bell, badge: unreadNotifications },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Icon className="size-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden p-2 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1">
              {[
                { id: 'overview', label: t("Admin.Overview"), icon: BarChart3 },
                { id: 'users', label: t("Admin.UserManagement"), icon: Users },
                { id: 'approvals', label: t("Admin.Approvals"), icon: CheckCircle },
                { id: 'analytics', label: t("Admin.Analytics"), icon: BarChart3 },
                { id: 'notifications', label: t("Admin.Notifications"), icon: Bell, badge: unreadNotifications },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left w-full ${activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.TotalUsers")}</h3>
                <Users className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-3xl font-semibold">
                {loading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">{t("Admin.PlatformUsers")}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.ActiveHospitals")}</h3>
                <Shield className="size-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-3xl font-semibold">
                {loading ? '—' : (stats?.totalHospitals ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">{t("Admin.Registered")}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.ActivePharmacies")}</h3>
                <Shield className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-semibold">
                {loading ? '—' : (stats?.totalPharmacies ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">{t("Admin.WithInventory")}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.PendingApprovals")}</h3>
                <CheckCircle className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-3xl font-semibold">
                {loading ? '—' : (stats?.pendingApprovals ?? 0)}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                {t("Admin.RequiresAttention")}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'approvals' && <ApprovalManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'notifications' && (
          <NotificationCenter onNotificationRead={loadNotifications} />
        )}
      </div>
    </div>
  );
}
