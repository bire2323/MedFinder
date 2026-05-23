import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  CheckCircle,
  BarChart3,
  Map,
  MapPin,
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
import LanguageSwitcher from '../../component/LanguageSwitcher';
import ThemeToggle from '../../component/DarkLightTeam';


export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { notifications, setNotifications } = useSystemNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const unreadNotifications = notifications.filter(n => !n.read_at).length;

  useEffect(() => {
    // Only load once when authenticated, and only if we haven't loaded before
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
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
    navigate('/');
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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/40">
      {/* Header - Glassmorphic Teal-to-Emerald Premium Bar */}
      <header className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-white/5 dark:border-slate-900 sticky top-0 z-40 shadow-lg shadow-slate-950/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/80 transition-all border border-slate-700/40"
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-500/10 border border-white/10">
                  <Shield className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black text-white leading-tight uppercase tracking-wider">
                    {t("Admin.AdminDashboard")}
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block leading-none mt-0.5">
                    {t("Admin.PlatformManagement")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 border-r border-slate-750 pr-3 mr-1">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <NavLink
                to="/admin/dashboard/notifications"
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/80 border border-slate-750 transition-all"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-0.5 shadow-md animate-pulse">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
              <button
                type="button"
                title='Logout'
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-750 transition-all cursor-pointer"
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
        {/* Desktop Tabs - Sliding indicator capsule */}
        <div className="hidden lg:flex w-full bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 mb-6 gap-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className="relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 select-none group"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="adminActiveTabIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 rounded-xl shadow-lg shadow-emerald-500/10 dark:shadow-none"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${isActive
                      ? 'text-white font-black'
                      : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-850 dark:hover:text-slate-200'
                      }`}>
                      <Icon className={`size-4 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {tab.label}
                      {tab.badge > 0 && (
                        <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none ${isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-red-500 text-white'
                          }`}>
                          {tab.badge}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden p-2 mb-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-lg"
          >
            <div className="flex flex-col gap-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.id}
                    to={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2.5 rounded-xl px-4.5 py-3 text-xs font-black uppercase tracking-wider transition-all border ${isActive
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent'
                      }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white leading-none">
                        {tab.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
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
