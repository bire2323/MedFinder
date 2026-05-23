/**
 * Pharmacy Agent Dashboard
 * Comprehensive dashboard with inventory management, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import useAuthStore from "../../store/UserAuthStore";
import { useNotifications, useSystemNotifications } from "../../hooks/UserNotification";
import useChatNotificationStore from "../../store/useChatNotificationStore";
import useSystemNotificationStore from "../../store/useSystemNotificationStore";
import NotificationToast from "../../component/NotificationToast";
import SystemNotificationToast from "../../component/SystemNotificationToast";
import AlertModal from "../../component/SupportiveComponent/AlertModal";
import {
  Pill,
  BarChart3,
  Settings,
  X,
  MessageSquare,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../../component/DarkLightTeam";

import { apiGetInventory, apiGetAnalytics } from "../../api/inventory";
import StatusBanner from "../../component/StatusBanner";
import NotificationDropdown from "../../component/NotificationDropdown";
import { FaUser, FaUserCircle } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { apiLogout } from "../../api/auth";
import { initializeAuth } from "../../auth/initAuth";
import { apiGetPharmacyProfile } from "../../api/hospital";

const PharmacyDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);

  const { user, roles } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const currentUserId = user?.id;

  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const { getUnreadCount } = useChatNotificationStore();
  const unreadCount = getUnreadCount();

  const { clearSession } = useAuthStore();

  useEffect(() => {
    const isInactive = user?.status === "inactive";
    if (isInactive) {
      setShowModal(true);
    }
  }, [user]);

  const handleLogout = () => {
    apiLogout().then(() => {
      clearSession();
      navigate("/");
    });
  };

  const { latestNotification } = useSystemNotificationStore();
  const { isAuthenticated } = useAuthStore();

  // useEffect(() => {
  //   const init = async () => {
  //     const isAuthentic = await initializeAuth();
  //     if (!isAuthentic) {
  //       navigate("/");
  //     }
  //   };
  //   init();
  // }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGetPharmacyProfile();
        if (response) {
          console.log(response.data);
          setPharmacyProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (latestNotification && (latestNotification.type === 'approved' || latestNotification.type === 'rejected')) {
      setPharmacyProfile(prev => prev ? {
        ...prev,
        status: latestNotification.type.toUpperCase(),
        rejection_reason: latestNotification.type === 'rejected' ? latestNotification.message.split('Reason: ')[1] || null : null
      } : prev);
    }
  }, [latestNotification]);

  useEffect(() => {
    useChatNotificationStore.getState().loadSessions();
  }, []);

  const [recentChats] = useState([
    { id: 1, user: "User123", message: "Do you have Amoxicillin?", time: "10 min ago", status: "unread" },
    { id: 2, user: "User456", message: "What's the price of Panadol?", time: "25 min ago", status: "read" },
    { id: 3, user: "User789", message: "Is Insulin available?", time: "1 hour ago", status: "read" },
  ]);

  useEffect(() => {
    const params = {
      search: "",
      category: "all",
      status: "all",
      page: 1,
      per_page: 8,
    };
    const fetchInv = async () => {
      try {
        const response = await apiGetInventory(params);
        if (response?.success) {
          setInventory(Array.isArray(response.data) ? response.data : []);
        }

        const analyticsRes = await apiGetAnalytics();
        if (analyticsRes?.success) {
          setAnalytics(analyticsRes.data);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInv();
  }, []);

  const navItems = [
    { path: "/pharmacy/dashboard/overview", icon: <BarChart3 size={20} />, label: t("PharmacyDashboard.Overview") },
    { path: "/pharmacy/dashboard/inventory", icon: <Pill size={20} />, label: t("PharmacyDashboard.Inventory") },
    { path: "/pharmacy/dashboard/chats", icon: <MessageSquare size={20} />, label: t("PharmacyDashboard.Chats"), badge: unreadCount > 0 ? unreadCount : null },
    { path: "/pharmacy/dashboard/settings", icon: <Settings size={20} />, label: t("PharmacyDashboard.Settings") },
  ];

  return (
    <>
      <div>
        {showModal && <AlertModal onClose={() => {
          setShowModal(false);
          navigate('/');
        }} />}
      </div>
      <NotificationToast />
      <SystemNotificationToast />
      <div className="min-h-screen min-w-[320px] bg-slate-50/50 dark:bg-slate-950 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}
        <nav className={`fixed lg:relative border-r border-slate-200/50 dark:border-slate-800/80 inset-y-0 left-0 z-40 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="sticky top-0 h-full flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/50">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl text-white shadow-md shadow-emerald-500/20">
                <Pill size={22} className="animate-pulse" />
              </div>
              <span className="block font-black text-xl tracking-tight text-slate-800 dark:text-white">
                Pharma<span className="text-emerald-500">Sync</span>
              </span>
            </div>

            <div className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto no-scrollbar">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                    ${isActive
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]"
                      : "text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="block font-bold text-sm tracking-wide">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
              <div className="hidden lg:flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  {pharmacyProfile?.pharmacy_name_en?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">
                    {pharmacyProfile?.pharmacy_name_en || "Pharmacy Agent"}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    {t("PharmacyDashboard.OwnerAccount")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col overflow-visible min-w-0">
          <header className="h-16 sm:h-20 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-800/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-sm shadow-slate-100/50 dark:shadow-none">
            <div className="flex items-center gap-4">
              <ChevronLeft className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hidden md:block text-xl cursor-pointer transition-colors" onClick={() => navigate("/")} />
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu size={24} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${pharmacyProfile?.status === 'APPROVED' ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`}></span>
                <span className="text-emerald-600 dark:text-emerald-400">{pharmacyProfile?.status === 'APPROVED' ? t("PharmacyDashboard.Live") : t("PharmacyDashboard.Hidden")}</span>
              </div>
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationDropdown />
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 border border-transparent hover:border-slate-200/50"
                  onClick={() => setToggleProfileDropDown(!toggleProfileDropDown)}
                >
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FaUserCircle size={32} />
                  </div>
                </button>

                {toggleProfileDropDown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setToggleProfileDropDown(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 z-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                        <p className="text-xs font-bold text-slate-400">
                          {t("headingNav.profile_dropdown.account")}
                        </p>
                        <p className="text-sm font-bold truncate dark:text-white">
                          {user?.Email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                      >
                        <FaUser className="text-emerald-500" />
                        <span>{t("headingNav.home")}</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                      >
                        <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <section className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            <StatusBanner
              status={pharmacyProfile?.status}
              rejectionReason={pharmacyProfile?.rejection_reason}
            />
            <div className="mt-2">
              <Outlet context={{
                inventory,
                analytics,
                recentChats,
                pharmacyProfile,
                currentUserId,
                onUpdateProfile: () => {
                  apiGetPharmacyProfile().then(res => res && setPharmacyProfile(res.data));
                }
              }} />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default PharmacyDashboard;
