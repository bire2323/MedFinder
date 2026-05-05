import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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
import ProfileSettingsLayout from "../shared/ProfileSettings/ProfileSettingsLayout";
import ChatsTab from "./components/ChatsTab";
import StatusBanner from "../../component/StatusBanner";
import NotificationDropdown from "../../component/NotificationDropdown";
import HospitalInventoryModal from "./components/HospitalInventoryModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

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
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const roles = user?.roles?.map(r => r.Name) || [];

  const { handleIncomingMessage, targetSessionToOpen, getUnreadCount } = useChatNotificationStore();
  const unreadCount = getUnreadCount();
  const { addNotification } = useSystemNotificationStore();

  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search Queries
  const [searchDeptQuery, setSearchDeptQuery] = useState("");
  const [searchServiceQuery, setSearchServiceQuery] = useState("");

  // Modal States
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [showDeleteDeptModal, setShowDeleteDeptModal] = useState(false);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);

  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [deptForm, setDeptForm] = useState({
    department_name_en: "",
    department_name_am: "",
    department_category_name_en: "",
    department_category_name_am: "",
  });

  const [serviceForm, setServiceForm] = useState({
    service_name_en: "",
    service_name_am: "",
    service_category_name_en: "",
    service_category_name_am: "",
    is_available: true,
    notes: "",
  });

  const resetDeptForm = () => setDeptForm({
    department_name_en: "",
    department_name_am: "",
    department_category_name_en: "",
    department_category_name_am: "",
  });

  const resetServiceForm = () => setServiceForm({
    service_name_en: "",
    service_name_am: "",
    service_category_name_en: "",
    service_category_name_am: "",
    is_available: true,
    notes: "",
  });
  const clearSession = useAuthStore((state) => state.clearSession);
  useEffect(() => {
    const init = async () => {
      const isAuthentic = await initializeAuth();
      if (!isAuthentic) navigate("/");
    };
    init();
  }, []);

  // // Real-time Chat
  // useNotifications(currentUserId, (incoming) => {
  //   handleIncomingMessage({
  //     message: incoming.message,
  //     senderName: incoming.sender.sender?.Name || `User ${incoming.sender_id}`,
  //     sessionId: incoming.chat_session_id,
  //     fullMessage: incoming
  //   });
  // });
  useEffect(() => {
    if (user?.status === "inactive") {
      setShowModal(true);
    }
  }, [user]);
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

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
    useChatNotificationStore.getState().loadSessions();
  }, [fetchData]);

  useEffect(() => {
    if (targetSessionToOpen) setActiveTab("chats");
  }, [targetSessionToOpen]);

  // Handlers for Departments
  const handleAddDept = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiAddDepartment(deptForm);
      if (res.success || res.id) {
        toast.success("Department added successfully!");
        setShowAddDeptModal(false);
        resetDeptForm();
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDept = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiUpdateDepartment(deptForm.id, deptForm);
      if (res.success || res.id) {
        toast.success("Department updated successfully!");
        setShowEditDeptModal(false);
        setSelectedDept(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDept = async () => {
    setIsSubmitting(true);
    try {
      await apiDeleteDepartment(selectedDept.id);
      toast.success("Department deleted.");
      setShowDeleteDeptModal(false);
      setSelectedDept(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Services
  const handleAddService = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiAddService(serviceForm);
      if (res.success || res.id) {
        toast.success("Service added Successfully!");
        setShowAddServiceModal(false);
        resetServiceForm();
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiUpdateService(serviceForm.id, serviceForm);
      if (res.success || res.id) {
        toast.success("Service updated successfully!");
        setShowEditServiceModal(false);
        setSelectedService(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    setIsSubmitting(true);
    try {
      await apiDeleteService(selectedService.id);
      toast.success("Service deleted.");
      setShowDeleteServiceModal(false);
      setSelectedService(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDeptModal = (dept) => {
    setDeptForm(dept);
    setShowEditDeptModal(true);
  };

  const openEditServiceModal = (service) => {
    setServiceForm(service);
    setShowEditServiceModal(true);
  };

  // Mock data for recent chats in Overview
  const recentInquiries = [
    { id: 1, user: "Patient_001", message: "Do you have emergency cardiac services available?", time: "5 min ago", status: "unread" },
    { id: 2, user: "Patient_042", message: "Is the Radiology department open tomorrow?", time: "20 min ago", status: "read" },
    { id: 3, user: "Patient_109", message: "Consultation fees for Pedatrics?", time: "1 hour ago", status: "read" },
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
      <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">

        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* SIDEBAR */}
        <nav className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                <Building2 size={28} />
              </div>
              <span className="block font-black text-2xl tracking-tighter">
                Hospi<span className="text-blue-600">Hub</span>
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <NavItem
              icon={<BarChart3 size={20} />}
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
            />
            <NavItem
              icon={<Layers size={20} />}
              label="Departments"
              active={activeTab === "departments"}
              onClick={() => { setActiveTab("departments"); setSidebarOpen(false); }}
            />
            <NavItem
              icon={<Stethoscope size={20} />}
              label="Services"
              active={activeTab === "services"}
              onClick={() => { setActiveTab("services"); setSidebarOpen(false); }}
            />
            <NavItem
              icon={<MessageSquare size={20} />}
              label="Chats"
              active={activeTab === "chats"}
              onClick={() => { setActiveTab("chats"); setSidebarOpen(false); }}
              badge={unreadCount > 0 ? unreadCount : null}
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={activeTab === "settings"}
              onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-gray-700/50 rounded-3xl border border-slate-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-black text-white shadow-lg shrink-0">
                {hospitalProfile?.hospital_name_en?.[0] || "H"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">{hospitalProfile?.hospital_name_en || "Hospital Agent"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Verified Hub</p>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* HEADER */}
          <header className="h-20 lg:h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 px-4 sm:px-8 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-100 dark:bg-gray-700 rounded-2xl active:scale-95 transition-transform shadow-sm">
                <Menu size={24} className="text-slate-700 dark:text-slate-200" />
              </button>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
                <span className={`w-2 h-2 rounded-full ${hospitalProfile?.status === 'APPROVED' ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="uppercase tracking-widest text-[10px]">{hospitalProfile?.status === 'APPROVED' ? "Live System" : "Pending Approval"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="hidden sm:flex items-center gap-4 border-r border-slate-200 dark:border-gray-700 pr-6 mr-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <div className="sm:hidden items-center border-r border-slate-200 dark:border-gray-700 ">
                <LanguageSwitcher />
              </div>
              <NotificationDropdown />


              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-all group"
                  onClick={() => setToggleProfileDropDown(!toggleProfileDropDown)}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 shadow-inner group-hover:ring-4 group-hover:ring-blue-500/10 transition-all">
                    <FaUserCircle size={32} />
                  </div>
                </button>

                <AnimatePresence>
                  {toggleProfileDropDown && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10"
                        onClick={() => setToggleProfileDropDown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 z-50 w-72 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-gray-800 p-4 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800 mb-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Sign in As</p>
                          <p className="text-sm font-black truncate dark:text-white uppercase tracking-tight">{user?.Email || "Agent Account"}</p>
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              if (roles?.includes("patient")) navigate("/user/dashboard");
                              else navigateByRole(roles, navigate);
                              setToggleProfileDropDown(false);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-black text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                          >
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                              <FaUser className="text-blue-500" />
                            </div>
                            My Account
                          </button>
                          <button
                            onClick={() => {
                              clearSession();
                              navigate("/");
                            }}
                            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group"
                          >
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
                              <LuLogOut />
                            </div>
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="sm:hidden block gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {console.log(hospitalProfile)}
          <section className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
            <StatusBanner
              status={hospitalProfile?.status}
              rejectionReason={hospitalProfile?.rejection_reason}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-5">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 size={24} className="text-blue-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Dashboard data...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeTab === "overview" && (
                    <OverviewTab
                      hospitalProfile={hospitalProfile}
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
                      filteredDepartments={departments.filter(d =>
                        d.department_name_en?.toLowerCase().includes(searchDeptQuery.toLowerCase()) ||
                        d.department_name_am?.includes(searchDeptQuery)
                      )}
                      resetDeptForm={resetDeptForm}
                      setShowAddDeptModal={setShowAddDeptModal}
                      isLoadingDepts={isLoading}
                      openEditDeptModal={openEditDeptModal}
                      setSelectedDept={setSelectedDept}
                      setShowDeleteDeptModal={setShowDeleteDeptModal}
                    />
                  )}

                  {activeTab === "services" && (
                    <ServicesTab
                      searchServiceQuery={searchServiceQuery}
                      setSearchServiceQuery={setSearchServiceQuery}
                      filteredServices={services.filter(s =>
                        s.service_name_en?.toLowerCase().includes(searchServiceQuery.toLowerCase()) ||
                        s.service_name_am?.includes(searchServiceQuery)
                      )}
                      resetServiceForm={resetServiceForm}
                      setShowAddServiceModal={setShowAddServiceModal}
                      isLoadingServices={isLoading}
                      openEditServiceModal={openEditServiceModal}
                      setSelectedService={setSelectedService}
                      setShowDeleteServiceModal={setShowDeleteServiceModal}
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
                    <div className="h-full">
                      <ChatsTab currentUserId={currentUserId} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </section>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Department Modals */}
        <HospitalInventoryModal
          isOpen={showAddDeptModal}
          onClose={() => setShowAddDeptModal(false)}
          onSubmit={handleAddDept}
          type="department"
          formData={deptForm}
          setFormData={setDeptForm}
          isSubmitting={isSubmitting}
          title="Create Department"
        />
        <HospitalInventoryModal
          isOpen={showEditDeptModal}
          onClose={() => { setShowEditDeptModal(false); setSelectedDept(null); }}
          onSubmit={handleEditDept}
          type="department"
          formData={deptForm}
          setFormData={setDeptForm}
          isSubmitting={isSubmitting}
          title="Edit Department"
        />
        <DeleteConfirmModal
          isOpen={showDeleteDeptModal}
          onClose={() => { setShowDeleteDeptModal(false); setSelectedDept(null); }}
          onConfirm={handleDeleteDept}
          itemName={selectedDept?.department_name_en}
          isSubmitting={isSubmitting}
        />

        {/* Service Modals */}
        <HospitalInventoryModal
          isOpen={showAddServiceModal}
          onClose={() => setShowAddServiceModal(false)}
          onSubmit={handleAddService}
          type="service"
          formData={serviceForm}
          setFormData={setServiceForm}
          isSubmitting={isSubmitting}
          title="Add New Service"
        />
        <HospitalInventoryModal
          isOpen={showEditServiceModal}
          onClose={() => { setShowEditServiceModal(false); setSelectedService(null); }}
          onSubmit={handleEditService}
          type="service"
          formData={serviceForm}
          setFormData={setServiceForm}
          isSubmitting={isSubmitting}
          title="Edit Service"
        />
        <DeleteConfirmModal
          isOpen={showDeleteServiceModal}
          onClose={() => { setShowDeleteServiceModal(false); setSelectedService(null); }}
          onConfirm={handleDeleteService}
          itemName={selectedService?.service_name_en}
          isSubmitting={isSubmitting}
        />
      </AnimatePresence>
    </>
  );
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${active
      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700/50 hover:text-slate-700 dark:hover:text-white"
      }`}
  >
    <div className="flex items-center gap-4">
      <div className={`${active ? "text-white" : "text-slate-400 group-hover:text-blue-500"} transition-colors`}>
        {icon}
      </div>
      <span className="block font-black text-sm uppercase tracking-widest">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 shadow-lg shadow-red-500/40">
        {badge}
      </span>
    )}
  </button>
);

export default HospitalDashboard;