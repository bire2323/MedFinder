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

  useEffect(() => {
    const init = async () => {
      const isAuthentic = await initializeAuth();
      if (!isAuthentic) {
        navigate("/");
      }
    };
    init();
  }, [isAuthenticated, navigate]);

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
        if (response) {
          const inventoryData = response.data || response;
          setInventory(inventoryData.drugs || (Array.isArray(inventoryData) ? inventoryData : []));
        }

        const analyticsRes = await apiGetAnalytics();
        if (analyticsRes.success) {
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
      <div className="min-h-screen min-w-[320px] bg-white dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}
        <nav className={`fixed lg:relative border-r border-slate-200 dark:border-gray-800 inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="sticky top-0 h-full flex flex-col">
            <div className="p-6 flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
                <Pill size={24} />
              </div>
              <span className="block font-bold text-xl tracking-tight">
                Pharma<span className="text-emerald-600">Sync</span>
              </span>
            </div>

            <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all
                    ${isActive
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span className="block font-bold text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="p-4 border-t border-gray-400 dark:border-gray-500">
              <div className="hidden lg:flex items-center gap-3 p-3 bg-slate-100 dark:bg-gray-700 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                  {pharmacyProfile?.pharmacy_name_en?.[0] || "P"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">{pharmacyProfile?.pharmacy_name_en || "Pharmacy Agent"}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    {t("PharmacyDashboard.OwnerAccount")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col overflow-visible min-w-0">
          <header className="h-14 sm:h-20 bg-emerald-600 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-400 dark:border-gray-500 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-4">
              <ChevronLeft className="text-white hidden md:block text-xl cursor-pointer" onClick={() => navigate("/")} />
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center"
              >
                <Menu size={24} className="text-slate-200" />
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-gray-400">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${pharmacyProfile?.status === 'APPROVED' ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="text-white">{pharmacyProfile?.status === 'APPROVED' ? t("PharmacyDashboard.Live") : t("PharmacyDashboard.Hidden")}</span>
              </div>
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationDropdown />
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-all"
                  onClick={() => setToggleProfileDropDown(!toggleProfileDropDown)}
                >
                  <div className="w-9 h-9 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600">
                    <FaUserCircle size={32} />
                  </div>
                </button>

                {toggleProfileDropDown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setToggleProfileDropDown(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 p-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-gray-800 mb-2">
                        <p className="text-xs font-bold text-slate-400">
                          {t("headingNav.profile_dropdown.account")}
                        </p>
                        <p className="text-sm font-bold truncate dark:text-white">
                          {user?.Email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (roles?.includes("patient")) navigate("/user/dashboard");
                          else navigateByRole(roles, navigate);
                          setToggleProfileDropDown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                      >
                        <FaUser className="text-blue-500" />
                        <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <section className="flex-1 p-8">
            <StatusBanner
              status={pharmacyProfile?.status}
              rejectionReason={pharmacyProfile?.rejection_reason}
            />
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
          </section>
        </main>
      </div>
    </>
  );
};

export default PharmacyDashboard;
