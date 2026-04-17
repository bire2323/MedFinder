/**
 * Hospital Agent Dashboard
 * Comprehensive dashboard with department management, services, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import useAuthStore from "../../store/UserAuthStore";
import { useNotifications, useSystemNotifications } from "../../hooks/UserNotification";
import useChatNotificationStore from "../../store/useChatNotificationStore";
import useSystemNotificationStore from "../../store/useSystemNotificationStore";
import NotificationToast from "../../component/NotificationToast";
import SystemNotificationToast from "../../component/SystemNotificationToast";
import {
  Building2,
  FileText,
  BarChart3,
  MapPin,
  AlertCircle,
  Search,
  Settings,
  Clock,
  Globe,
  Camera,
  Save,
  Activity,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  MessageSquare,
  Layers,
  Stethoscope,
  Users,
  ChevronLeft,
  ChevronRight,
  MenuIcon,
  Menu,
} from "lucide-react";
import ThemeToggle from "../../component/DarkLightTeam";

// Hospital Components
import OverviewTab from "./components/OverviewTab";
import DepartmentsTab from "./components/DepartmentsTab";
import ServicesTab from "./components/ServicesTab";
import ProfileSettingsLayout from "../shared/ProfileSettings";
import ChatsTab from "./components/ChatsTab";
import StatusBanner from "../../component/StatusBanner";
import NotificationDropdown from "../../component/NotificationDropdown";

// API
import {
  getHospitalDetails,
  apiGetDepartments,
  apiGetServices,
  apiAddDepartment,
  apiUpdateDepartment,
  apiDeleteDepartment,
  apiAddService,
  apiUpdateService,
  apiDeleteService
} from "../../api/hospital";

import { useTranslation } from "react-i18next";
import { initializeAuth } from "../../auth/initAuth";
import { LuLogOut } from "react-icons/lu";
import { FaUser, FaUserCircle } from "react-icons/fa";
import { navigateByRole } from "../../utils/UserNavigation";

const HospitalDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const { handleIncomingMessage, targetSessionToOpen, getUnreadCount } = useChatNotificationStore();
  const unreadCount = getUnreadCount();
  const { addNotification } = useSystemNotificationStore();

  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search/Filters (could be moved to tabs but keeping here for consistency with components props)
  const [searchDeptQuery, setSearchDeptQuery] = useState("");
  const [searchServiceQuery, setSearchServiceQuery] = useState("");


  useEffect(() => {
    const init = async () => {
      const isAuthentic = await initializeAuth();
      //console.log(isAuthentic);
      if (!isAuthentic) {
        navigate("/");
      }
    };

    init();
  }, [])
  // Real-time Chat
  useNotifications(currentUserId, (incoming) => {
    handleIncomingMessage({
      message: incoming.message,
      senderName: incoming.sender.sender?.Name || `User ${incoming.sender_id}`,
      sessionId: incoming.chat_session_id,
      fullMessage: incoming
    });
  });

  // React to system notifications via the global store
  const { latestNotification } = useSystemNotificationStore();

  useEffect(() => {
    if (latestNotification && (latestNotification.type === 'approved' || latestNotification.type === 'rejected')) {
      setHospitalProfile(prev => prev ? {
        ...prev,
        status: latestNotification.type.toUpperCase(),
        rejection_reason: latestNotification.type === 'rejected' ? latestNotification.message.split('Reason: ')[1] || null : null
      } : prev);
    }
  }, [latestNotification]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, deptsRes, servicesRes] = await Promise.all([
          getHospitalDetails(),
          apiGetDepartments(),
          apiGetServices()
        ]);

        setHospitalProfile(profileRes.data || profileRes);
        setDepartments(Array.isArray(deptsRes) ? deptsRes : (deptsRes.data || []));
        setServices(Array.isArray(servicesRes) ? servicesRes : (servicesRes.data || []));
      } catch (error) {
        console.error("Error fetching hospital data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    useChatNotificationStore.getState().loadSessions();
  }, []);

  useEffect(() => {
    if (targetSessionToOpen) {
      setActiveTab("chats");
    }
  }, [targetSessionToOpen]);

  // Mock data for recent chats in Overview
  const recentInquiries = [
    { id: 1, user: "Patient_001", message: "Do you have emergency cardiac services available?", time: "5 min ago", status: "unread" },
    { id: 2, user: "Patient_042", message: "Is the Radiology department open tomorrow?", time: "20 min ago", status: "read" },
    { id: 3, user: "Patient_109", message: "Consultation fees for Pedatrics?", time: "1 hour ago", status: "read" },
  ];

  return (
    <>
      <NotificationToast />
      <SystemNotificationToast />
      <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">

        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* SIDEBAR */}
        <nav className={`fixed sm:relative inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-400 dark:border-gray-500 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <span className="block font-bold text-xl tracking-tight">
              Hosp<span className="text-blue-600">Sync</span>
            </span>
          </div>

          <div className="flex-1 px-4 space-y-2 mt-4">
            <NavItem
              icon={<BarChart3 size={20} />}
              label={t('HospitalDashboard.Overview')}
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <NavItem
              icon={<Layers size={20} />}
              label={t('HospitalDashboard.Departments')}
              active={activeTab === "departments"}
              onClick={() => setActiveTab("departments")}
            />
            <NavItem
              icon={<Stethoscope size={20} />}
              label={t('HospitalDashboard.Services')}
              active={activeTab === "services"}
              onClick={() => setActiveTab("services")}
            />
            <NavItem
              icon={<MessageSquare size={20} />}
              label={t('HospitalDashboard.Chats')}
              active={activeTab === "chats"}
              onClick={() => setActiveTab("chats")}
              badge={unreadCount > 0 ? unreadCount : null}
            />
            <NavItem
              icon={<Settings size={20} />}
              label={t('HospitalDashboard.Settings')}
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
            />
          </div>

          <div className="p-4 border-t border-gray-400 dark:border-gray-500">
            <div className="hidden lg:flex items-center gap-3 p-3 bg-slate-100 dark:bg-gray-700 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs">
                {hospitalProfile?.hospital_name_en?.[0] || "H"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{hospitalProfile?.hospital_name_en || t('HospitalDashboard.HospitalAgent')}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">{t('HospitalDashboard.OwnerAccount')}</p>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* HEADER */}
          <header className="h-14 sm:h-20 bg-blue-600 dark:bg-gray-800/80 backdrop-blur-md border-b border-b-gray-200 border-gray-400 dark:border-gray-500 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
            <div>
              <div>
                <ChevronLeft className="text-white hidden md:block text-xl" onClick={() => navigate("/")} />
              </div>
              {/* Mobile toggle button */}
              <button
                type="button"
                //onClick={() => setSidebarOpen(true)}
                className="sm:hidden z-60 w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm flex items-center justify-center"
                aria-label={t("UserDashboard.OpenNavigation")}
              >
                <Menu size={20} className="text-slate-700 dark:text-slate-200 text-5xl" />
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
                        // onClick={handleLogout}
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
          <header className="h-14 sm:h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-400 dark:border-gray-500 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-gray-400 transition-colors">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${hospitalProfile?.status === 'APPROVED' ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="hidden sm:inline">{hospitalProfile?.status === 'APPROVED' ? t('HospitalDashboard.Live') : t('HospitalDashboard.Hidden')}</span>
              </div>
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationDropdown />
              <button className="sm:hidden p-2" onClick={() => setSidebarOpen(true)}>
                <MenuIcon size={24} />
              </button>
            </div>
          </header>

          {/* CONTENT */}
          <section className="flex-1 overflow-y-auto p-8">
            <StatusBanner
              status={hospitalProfile?.status}
              rejectionReason={hospitalProfile?.rejection_reason}
            />

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-blue-500" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <OverviewTab
                    departments={departments}
                    services={services}
                    recentChats={recentInquiries}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === "departments" && (
                  <DepartmentsTab
                    searchDeptQuery={searchDeptQuery}
                    setSearchDeptQuery={setSearchDeptQuery}
                    filteredDepartments={departments.filter(d => d.name.toLowerCase().includes(searchDeptQuery.toLowerCase()))}
                    // For now keeping actions simplified or using placeholders as modal logic depends on full implementation
                    resetDeptForm={() => { }}
                    setShowAddDeptModal={() => { }}
                    isLoadingDepts={false}
                    openEditDeptModal={() => { }}
                    setSelectedDept={() => { }}
                    setShowDeleteDeptModal={() => { }}
                  />
                )}

                {activeTab === "services" && (
                  <ServicesTab
                    searchServiceQuery={searchServiceQuery}
                    setSearchServiceQuery={setSearchServiceQuery}
                    filteredServices={services.filter(s => s.name.toLowerCase().includes(searchServiceQuery.toLowerCase()))}
                    resetServiceForm={() => { }}
                    setShowAddServiceModal={() => { }}
                    isLoadingServices={false}
                    openEditServiceModal={() => { }}
                    setSelectedService={() => { }}
                    setShowDeleteServiceModal={() => { }}
                  />
                )}

                {activeTab === "settings" && (
                  <ProfileSettingsLayout
                    initialData={hospitalProfile}
                    type="hospital"
                    onUpdateSuccess={() => {
                      getHospitalDetails().then(res => setHospitalProfile(res.data || res));
                    }}
                  />
                )}

                {activeTab === "chats" && (
                  <ChatsTab currentUserId={currentUserId} />
                )}
              </AnimatePresence>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${active
      ? "bg-blue-600 text-white shadow-lg"
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

export default HospitalDashboard;