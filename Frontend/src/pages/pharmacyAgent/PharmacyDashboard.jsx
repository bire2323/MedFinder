/**
 * Pharmacy Agent Dashboard
 * Comprehensive dashboard with inventory management, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import useAuthStore from "../../store/UserAuthStore";
import { useNotifications, useSystemNotifications } from "../../hooks/UserNotification";
import useChatNotificationStore from "../../store/useChatNotificationStore";
import useSystemNotificationStore from "../../store/useSystemNotificationStore";
import NotificationToast from "../../component/NotificationToast";
import SystemNotificationToast from "../../component/SystemNotificationToast";
import {
  Pill,
  FileText,
  BarChart3,
  MapPin,
  AlertCircle,
  Search,
  Settings,
  Store,
  Clock,
  Globe,
  Camera,
  Save,
  Navigation,
  Phone,
  Activity,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  MessageSquare,
  Calendar,
  Package,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MenuIcon,
  ArrowLeft,
  ArrowBigLeft,
  ArrowDownLeft,
  Menu,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../../component/DarkLightTeam";

import Inventory from "./Inventory";
import { apiGetInventory } from "../../api/inventory";
import { apiFetch } from "../../api/client";

// Import Refactored Components
import OverviewTab from "./components/OverviewTab";
import ProfileSettingsLayout from "../shared/ProfileSettings";
import ChatsTab from "./components/ChatsTab";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);

  const { user, roles } = useAuthStore();
  const currentUserId = user?.id;

  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [inventory, setInventory] = useState([]);

  const { handleIncomingMessage, targetSessionToOpen, getUnreadCount } = useChatNotificationStore();
  const unreadCount = getUnreadCount();

  const { addNotification } = useSystemNotificationStore();
  const { clearSession } = useAuthStore();

  useNotifications(currentUserId, (incoming) => {
    handleIncomingMessage({
      message: incoming.message,
      senderName: incoming.sender.sender?.Name || `User ${incoming.sender_id}`,
      sessionId: incoming.chat_session_id,
      fullMessage: incoming
    });
  });
  const handleLogout = () => {
    apiLogout().then(() => {
      clearSession();
      navigate("/");
    });
  };
  // React to system notifications via the global store
  const { latestNotification } = useSystemNotificationStore();
  const { isAuthenticated } = useAuthStore();
  //console.log(isAuthenticated);
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
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGetPharmacyProfile();
        if (response) {
          const profileData = response.data;
          setPharmacyProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [])
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

  useEffect(() => {
    if (targetSessionToOpen) {
      setActiveTab("chats");
    }
  }, [targetSessionToOpen]);


  // --- Profile State ---


  // --- Inventory State ---




  // --- Recent Chats (mock data) ---
  const [recentChats] = useState([
    { id: 1, user: "User123", message: "Do you have Amoxicillin?", time: "10 min ago", status: "unread" },
    { id: 2, user: "User456", message: "What's the price of Panadol?", time: "25 min ago", status: "read" },
    { id: 3, user: "User789", message: "Is Insulin available?", time: "1 hour ago", status: "read" },
  ]);




  useEffect(() => {
    const fetchInv = async () => {
      try {
        const response = await apiGetInventory();
        if (response) {
          const inventoryData = response.data || response;
          //   setPharmacyProfile(inventoryData);

          setInventory(inventoryData.drugs || Array.isArray(inventoryData) ? inventoryData : []);
          //  console.log('Inventory loaded:', inventoryData.drugs?.length || inventoryData?.length);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInv();
  }, []);



  return (
    <>
      <NotificationToast />
      <SystemNotificationToast />
      <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}
        {/* SIDEBAR - responsive: collapsed on mobile, overlay when open */}
        <nav className={`fixed sm:relative  inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
          <div className="sticky top-0">
            <div className="flex flex-col justify-between h-full">
              <div className=" p-6 flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
                  <Pill size={24} />
                </div>
                <span className="block font-bold text-xl tracking-tight">
                  Pharma<span className="text-emerald-600">Sync</span>

                </span>
              </div>

              <div className="flex-1 px-4 space-y-2 mt-4">
                <NavItem
                  icon={<BarChart3 size={20} />}
                  label={t("PharmacyDashboard.Overview")}
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                />
                <NavItem
                  icon={<Pill size={20} />}
                  label={t("PharmacyDashboard.Inventory")}
                  active={activeTab === "inventory"}
                  onClick={() => setActiveTab("inventory")}
                />
                <NavItem
                  icon={<FileText size={20} />}
                  label={t("PharmacyDashboard.Prescriptions")}
                  active={activeTab === "rx"}
                  onClick={() => setActiveTab("rx")}
                />
                <NavItem
                  icon={<MessageSquare size={20} />}
                  label={t("PharmacyDashboard.Chats")}
                  active={activeTab === "chats"}
                  onClick={() => setActiveTab("chats")}
                  badge={unreadCount > 0 ? unreadCount : null}
                />
                <NavItem
                  icon={<Settings size={20} />}
                  label={t("PharmacyDashboard.Settings")}
                  active={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-400 dark:border-gray-500">
              <div className="hidden lg:flex items-center gap-3 p-3 bg-slate-100 dark:bg-gray-700 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                  AP
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">{pharmacyProfile?.pharmacy_name_en || pharmacyProfile?.name || "Pharmacy Agent"}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    {t("PharmacyDashboard.OwnerAccount")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col overflow-visible min-w-0">
          {/* HEADER */}
          <header className="h-14 sm:h-20 bg-emerald-600 dark:bg-gray-800/80 backdrop-blur-md border-b border-b-gray-200 border-gray-400 dark:border-gray-500 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
            <div>
              <div>
                <ChevronLeft className="text-white hidden md:block text-xl" onClick={() => navigate("/")} />
              </div>
              {/* Mobile toggle button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="sm:hidden z-60 rounded-xl shadow-sm flex items-center justify-center"
                aria-label={t("UserDashboard.OpenNavigation")}
              >
                <Menu size={20} className="text-slate-200 text-5xl" />
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-gray-400 transition-colors">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${pharmacyProfile?.status === 'APPROVED' ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="hidden sm:inline">{pharmacyProfile?.status === 'APPROVED' ? t("PharmacyDashboard.Live") : t("PharmacyDashboard.Hidden")}</span>
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
                    <div className="absolute right-0 mt-3 w-64 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 p-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-gray-800 mb-2">
                        <p className="text-xs font-bold text-slate-400">
                          {t("headingNav.profile_dropdown.account")}
                        </p>
                        <p className="text-sm font-bold truncate dark:text-white">
                          {user?.Email}
                        </p>
                      </div>
                      <NavLink
                        to="#"
                        onClick={() => {
                          if (roles?.includes("patient")) {
                            navigate("/user/dashboard", { replace: true });
                          } else {
                            navigateByRole(roles, navigate);
                          }
                        }}
                        className="flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                      >
                        <FaUser className="text-blue-500" />
                        <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <section className="flex-1 h-screen p-8">
            <StatusBanner
              status={pharmacyProfile?.status}
              rejectionReason={pharmacyProfile?.rejection_reason}
            />
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <OverviewTab inventory={inventory} recentChats={recentChats} setActiveTab={setActiveTab} />
              )}

              {/* INVENTORY TAB */}
              {activeTab === "inventory" && (
                <Inventory activeTab={activeTab} setActiveTab={setActiveTab} />

              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <ProfileSettingsLayout
                  initialData={pharmacyProfile}
                  type="pharmacy"
                  onUpdateSuccess={() => {
                    apiGetPharmacyProfile().then(res => {
                      if (res.success) {
                        console.log(res.success);
                        const profileData = res.data;
                        setPharmacyProfile(profileData);
                      }
                    });
                  }}
                />
              )}

              {/* CHATS TAB */}
              {activeTab === "chats" && (
                <ChatsTab currentUserId={currentUserId} />
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </>
  );
};

// --- Subcomponents ---
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${active
      ? "bg-emerald-600 text-white shadow-lg"
      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700"
      }`}
  >
    <div className="flex items-center gap-4">
      {icon}
      <span className="block font-bold text-sm">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
        {badge}
      </span>
    )}
  </button>
);

export default PharmacyDashboard;
