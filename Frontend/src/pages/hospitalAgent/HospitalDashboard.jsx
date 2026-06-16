import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import useAuthStore from "../../store/UserAuthStore";
import { useNotifications, useSystemNotifications } from "../../hooks/UserNotification";
import useChatNotificationStore from "../../store/useChatNotificationStore";
import useSystemNotificationStore from "../../store/useSystemNotificationStore";
import NotificationToast from "../../component/NotificationToast";
import SystemNotificationToast from "../../component/SystemNotificationToast";
import Loading from "../../component/SupportiveComponent/Loading";
import {
  Building2,
  BarChart3,
  Settings,
  X,
  MessageSquare,
  Layers,
  Stethoscope,
  Menu,
  ChevronLeft,
} from "lucide-react";
import ThemeToggle from "../../component/DarkLightTeam";

// Hospital Components
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const roles = user?.roles?.map(r => r.Name) || [];

  const { getUnreadCount } = useChatNotificationStore();
  const unreadCount = getUnreadCount();

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

// <<<<<<< HEAD
  useEffect(() => {

    const init = async () => {
      const isAuthentic = await initializeAuth();
      if (!isAuthentic) navigate("/");
    };
    init();
  }, [navigate]);
// =======
//   // useEffect(() => {
//   //   const init = async () => {
//   //     const isAuthentic = await initializeAuth();
//   //     if (!isAuthentic) navigate("/");
//   //   };
//   //   init();
//   // }, [navigate]);
// >>>>>>> 19a7c898b0044586c597eacd5183ec6bc8f38f05

  useEffect(() => {
    if (user?.status === "inactive") {
      setShowModal(true);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, deptsRes, servicesRes] = await Promise.all([
        getHospitalDetails(),
        apiGetDepartments(),
        apiGetServices()
      ]);
      // console.log(profileRes.data);
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

  const recentInquiries = [
    { id: 1, user: "Patient_001", message: "Do you have emergency cardiac services available?", time: "5 min ago", status: "unread" },
    { id: 2, user: "Patient_042", message: "Is the Radiology department open tomorrow?", time: "20 min ago", status: "read" },
    { id: 3, user: "Patient_109", message: "Consultation fees for Pedatrics?", time: "1 hour ago", status: "read" },
  ];

  const navItems = [
    { path: "/hospital/dashboard/overview", icon: <BarChart3 size={20} />, label: "Overview" },
    { path: "/hospital/dashboard/departments", icon: <Layers size={20} />, label: "Departments" },
    { path: "/hospital/dashboard/services", icon: <Stethoscope size={20} />, label: "Services" },
    { path: "/hospital/dashboard/chats", icon: <MessageSquare size={20} />, label: "Chats", badge: unreadCount > 0 ? unreadCount : null },
    { path: "/hospital/dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <>
      <NotificationToast />
      <SystemNotificationToast />
      {/* HEADER */}
      <header className="h-20 sticky top-0 z-50 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/40 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm shadow-slate-100/40 dark:shadow-none">
        <div className="flex gap-4 items-center">
          <div className="flex items-center bg-transparent gap-3 py-1.5 px-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Building2 size={22} />
            </div>
            <span className="block font-black text-lg tracking-tighter leading-none dark:text-white">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1 truncate max-w-[120px]">{hospitalProfile?.hospital_name_en || ""}</p>
              Hospi<span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ChevronLeft className="text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors hidden md:block text-xl cursor-pointer" onClick={() => navigate("/")} />


            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${hospitalProfile?.status === 'APPROVED' ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className="uppercase tracking-wider text-[9px] text-slate-500 dark:text-slate-450">{hospitalProfile?.status === 'APPROVED' ? "Live System" : "Pending Approval"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden sm:flex items-center gap-4 border-r border-slate-200 dark:border-gray-700 pr-6 mr-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {/* <NotificationDropdown /> */}

          <div className="relative">
            <button
              className="flex items-center gap-2 p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-full transition-all group"
              onClick={() => setToggleProfileDropDown(!toggleProfileDropDown)}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 border border-slate-200/40 dark:border-slate-850">
                <FaUserCircle size={28} />
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
                    className="absolute right-0 mt-4 z-50 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Sign in As</p>
                      <p className="text-sm font-black truncate dark:text-white uppercase tracking-tight">{user?.Email || "Agent Account"}</p>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-black text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-2xl transition-all group cursor-pointer"
                      >
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                          <FaUser className="text-blue-500" />
                        </div>
                        HOME
                      </button>
                      <button
                        onClick={() => {
                          clearSession();
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group cursor-pointer"
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
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all rounded-2xl">
            <Menu size={20} className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>
      </header>
      <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">

        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* SIDEBAR */}
        <nav className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/80 flex flex-col transform transition-transform duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40">
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  relative w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 active:scale-98 overflow-hidden group
                  ${isActive
                    ? "text-white shadow-xl shadow-blue-500/20 font-black"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700 dark:hover:text-slate-200"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="hospitalSidebarActiveTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-4">
                      <span className={`${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors"}`}>
                        {item.icon}
                      </span>
                      <span className="block font-black text-xs uppercase tracking-widest">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="relative z-10 bg-red-550 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-slate-50 dark:border-slate-800/40">
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-850/80 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-md shrink-0">
                {hospitalProfile?.hospital_name_en?.[0] || "H"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-white truncate">{hospitalProfile?.hospital_name_en || "Hospital Agent"}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">OWNER ACCOUNT</p>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">


          <section className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
            <StatusBanner
              status={hospitalProfile?.status}
              rejectionReason={hospitalProfile?.rejection_reason}
            />

            {isLoading ? (
              <Loading label="Synchronizing Dashboard data..." />
            ) : (
              <Outlet context={{
                hospitalProfile,
                departments,
                services,
                isLoading,
                searchDeptQuery,
                setSearchDeptQuery,
                searchServiceQuery,
                setSearchServiceQuery,
                resetDeptForm,
                setShowAddDeptModal,
                resetServiceForm,
                setShowAddServiceModal,
                openEditDeptModal,
                setSelectedDept,
                setShowDeleteDeptModal,
                openEditServiceModal,
                setSelectedService,
                setShowDeleteServiceModal,
                recentChats: recentInquiries,
                currentUserId
              }} />
            )}
          </section>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
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

export default HospitalDashboard;