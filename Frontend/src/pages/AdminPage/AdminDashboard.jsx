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
      if (!isAuthentic) {
        navigate("/");
      }
    };
    init();
  }, [isAuthenticated]);

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

  const tabs = [
    { id: 'overview', label: t("Admin.Overview"), icon: BarChart3 },
    { id: 'users', label: t("Admin.UserManagement"), icon: Users },
    { id: 'approvals', label: t("Admin.Approvals"), icon: CheckCircle },
    { id: 'analytics', label: t("Admin.Analytics"), icon: BarChart3 },
    { id: 'notifications', label: t("Admin.Notifications"), icon: Bell, badge: unreadNotifications },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-lg shadow-md shadow-indigo-200 dark:shadow-none">
                  <Shield className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {t("Admin.AdminDashboard")}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-gray-400 hidden sm:block leading-tight">
                    {t("Admin.PlatformManagement")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700 transition-colors"
                onClick={() => setActiveTab('notifications')}
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-0.5 shadow">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              <button
                type="button"
                title='Logout'
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* Desktop Tabs */}
        <div className="hidden lg:flex w-full bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-slate-200 dark:border-gray-800 mb-6 gap-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden p-2 mb-5 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-lg">
            <div className="flex flex-col gap-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-left w-full transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  {t("Admin.TotalUsers")}
                </p>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Users className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.totalUsers ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">{t("Admin.PlatformUsers")}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  {t("Admin.ActiveHospitals")}
                </p>
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Shield className="size-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.totalHospitals ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">{t("Admin.Registered")}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  {t("Admin.ActivePharmacies")}
                </p>
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                  <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.totalPharmacies ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">{t("Admin.WithInventory")}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  {t("Admin.PendingApprovals")}
                </p>
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <CheckCircle className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.pendingApprovals ?? 0)}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">{t("Admin.RequiresAttention")}</p>
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
