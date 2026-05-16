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
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/UserAuthStore';
import { getNotifications } from '../../api/admin';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import useSystemNotificationStore from '../../store/useSystemNotificationStore';
import { initializeAuth } from '../../auth/initAuth';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { notifications, setNotifications } = useSystemNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const unreadNotifications = notifications.filter(n => !n.read_at).length;
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
      setNotifications(list);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuthentic = await initializeAuth();
      if (!isAuthentic) {
        navigate("/");
      }
    };
    init();
  }, [isAuthenticated, navigate]);

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
    { id: 'overview', label: t("Admin.Overview"), icon: BarChart3, path: '/admin/dashboard/overview' },
    { id: 'users', label: t("Admin.UserManagement"), icon: Users, path: '/admin/dashboard/users' },
    { id: 'approvals', label: t("Admin.Approvals"), icon: CheckCircle, path: '/admin/dashboard/approvals' },
    { id: 'analytics', label: t("Admin.Analytics"), icon: BarChart3, path: '/admin/dashboard/analytics' },
    { id: 'auditlog', label: t("Admin.AuditLog"), icon: Shield, path: '/admin/dashboard/auditlog' },
    { id: 'notifications', label: t("Admin.Notifications"), icon: Bell, path: '/admin/dashboard/notifications', badge: unreadNotifications },
    { id: "settings", label: t('settings'), icon: Settings, path: "/admin/dashboard/settings" }
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
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              <NavLink
                to="/admin/dashboard/notifications"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-0.5 shadow">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
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
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${isActive
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
              </NavLink>
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
                  <NavLink
                    key={tab.id}
                    to={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-left w-full transition-colors ${isActive
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
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Outlet for Tab Contents */}
        <Outlet context={{
          stats,
          loading,
          loadNotifications
        }} />
      </div>
    </div>
  );
}
