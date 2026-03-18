


function HospitalForm({ hospital, onSave }) {
  const [form, setForm] = useState(() => ({
    name: hospital?.name || '',
    location: hospital?.location || '',
    working_hours: hospital?.working_hours || '',
    services: hospital?.services || '',
    logo_url: hospital?.logo_url || '',
    license_details: hospital?.license_details || '',
    emergency_contact: hospital?.emergency_contact || '',
    latitude: hospital?.latitude || '',
    longitude: hospital?.longitude || '',
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: hospital?.name || '',
      location: hospital?.location || '',
      working_hours: hospital?.working_hours || '',
      services: hospital?.services || '',
      logo_url: hospital?.logo_url || '',
      license_details: hospital?.license_details || '',
      emergency_contact: hospital?.emergency_contact || '',
      latitude: hospital?.latitude || '',
      longitude: hospital?.longitude || '',
    }));
  }, [hospital]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    try {
      setSaving(true);
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Input
        label="Hospital Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <Input
        label="Location"
        name="location"
        value={form.location}
        onChange={handleChange}
        required
      />
      <Input
        label="Working Hours"
        name="working_hours"
        value={form.working_hours}
        onChange={handleChange}
        placeholder="e.g., 24/7 or Mon–Fri 8:00–18:00"
      />
      <Input
        label="Emergency Contact"
        name="emergency_contact"
        value={form.emergency_contact}
        onChange={handleChange}
        placeholder="+251-xxx-xxx-xxx"
      />
      <div className="md:col-span-2">
        <Label>Services</Label>
        <textarea
          name="services"
          value={form.services}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="List key services, separated by commas"
        />
      </div>
      <Input
        label="Logo URL"
        name="logo_url"
        value={form.logo_url}
        onChange={handleChange}
      />
      <Input
        label="License Details"
        name="license_details"
        value={form.license_details}
        onChange={handleChange}
      />
      <Input
        label="Latitude"
        name="latitude"
        value={form.latitude}
        onChange={handleChange}
      />
      <Input
        label="Longitude"
        name="longitude"
        value={form.longitude}
        onChange={handleChange}
      />
      <div className="md:col-span-2 flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving || !form.name.trim() || !form.location.trim()}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Hospital Info'}
        </button>
      </div>
    </form>
  );
}

function DepartmentManager({ hospital, departments, onSave }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    working_hours: '',
    services: '',
  });

  const startNew = () => {
    setEditing(null);
    setForm({ name: '', working_hours: '', services: '' });
  };

  const startEdit = (dep) => {
    setEditing(dep);
    setForm({
      name: dep.name || '',
      working_hours: dep.working_hours || '',
      services: dep.services || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSave({ ...(editing || {}), ...form });
    startNew();
  };

  if (!hospital?.id) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Save hospital information first to manage departments and services.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg"
      >
        <Input
          label="Department Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Working Hours"
          name="working_hours"
          value={form.working_hours}
          onChange={handleChange}
        />
        <Input
          label="Services"
          name="services"
          value={form.services}
          onChange={handleChange}
          placeholder="Comma separated"
        />
        <div className="md:col-span-3 flex justify-end gap-2 pt-2">
          {editing && (
            <button
              type="button"
              onClick={startNew}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!form.name.trim()}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {editing ? 'Update Department' : 'Add Department'}
          </button>
        </div>
      </form>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Working Hours</th>
              <th className="px-3 py-2 text-left font-medium">Services</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {(departments || []).map((dep) => (
              <tr key={dep.id}>
                <td className="px-3 py-2">{dep.name}</td>
                <td className="px-3 py-2">{dep.working_hours}</td>
                <td className="px-3 py-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {dep.services}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(dep)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {(!departments || departments.length === 0) && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  No departments yet. Add your first department above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfileForm({ profile, onSave }) {
  const [form, setForm] = useState(() => ({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    });
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      setSaving(true);
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4"
    >
      <Input
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Phone"
        name="phone"
        value={form.phone}
        onChange={handleChange}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !form.name.trim() || !form.email.trim()}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}

function HospitalMap({ hospital }) {
  if (!hospital?.latitude || !hospital?.longitude) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Add latitude and longitude to hospital information to enable map view.
      </p>
    );
  }

  const lat = parseFloat(hospital.latitude);
  const lng = parseFloat(hospital.longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Invalid coordinates. Please enter valid latitude and longitude.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Patients can navigate to this location via OpenStreetMap.
      </p>
      <div className="h-80 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              {hospital.name}
              <br />
              {hospital.location}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <a
        href={`https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lng}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Open directions in OpenStreetMap
      </a>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
      {children}
    </label>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <input
        {...props}
        className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${props.className || ''
          }`}
      />
    </div>
  );
}

/**
 * Hospital Agent Dashboard
 * Comprehensive dashboard with department & service management, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  FileText,
  BarChart3,
  AlertCircle,
  Search,
  Settings,
  Clock,
  Globe,
  Camera,
  Save,
  Phone,
  Activity,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  MessageSquare,
  Users,
  Stethoscope,
  Heart,
  CheckCircle,
  Layers,
  ChevronLeft,
  ChevronRight,

} from "lucide-react";
import ThemeToggle from "../../component/DarkLightTeam";
import {
  apiGetDepartments,
  apiAddDepartment,
  apiUpdateDepartment,
  apiDeleteDepartment,
  apiGetServices,
  apiAddService,
  apiUpdateService,
  apiDeleteService,
} from "../../api/hospital";
import LanguageSwitcher from "../../component/LanguageSwitcher";

import { useTranslation } from "react-i18next";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Profile State ---
  const [profile, setProfile] = useState({
    name: "St. Gabriel General Hospital",
    license: "HO-4520-ETH",
    email: "contact@stgabriel.com",
    phone: "+251 911 55 66 77",
    address: "Megenagna, Addis Ababa",
    coordinates: { lat: 9.02, lng: 38.78 },
    isPublic: true,
    providesEmergency: true,
    operates24Hours: true,
  });

  // --- Departments State ---
  const [departments, setDepartments] = useState([]);
  const [searchDeptQuery, setSearchDeptQuery] = useState("");
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  // --- Services State ---
  const [services, setServices] = useState([]);
  const [searchServiceQuery, setSearchServiceQuery] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // --- Modal States ---
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [showDeleteDeptModal, setShowDeleteDeptModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form States ---
  const [deptForm, setDeptForm] = useState({
    name: "",
    description: "",
    headDoctor: "",
    phone: "",
    floor: "",
    isActive: true,
  });

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    department: "",
    isAvailable: true,
  });

  // --- Recent Chats (mock data) ---
  const [recentChats] = useState([
    { id: 1, user: "Patient123", message: "Is cardiology available today?", time: "5 min ago", status: "unread" },
    { id: 2, user: "User456", message: "What are visiting hours?", time: "30 min ago", status: "read" },
    { id: 3, user: "User789", message: "Emergency contact number?", time: "2 hours ago", status: "read" },
  ]);

  // --- Fetch Data ---
  useEffect(() => {
    if (activeTab === "departments" || activeTab === "overview") {
      fetchDepartments();
    }
    if (activeTab === "services" || activeTab === "overview") {
      fetchServices();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    setIsLoadingDepts(true);
    try {
      const response = await apiGetDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      } else {
        // Mock data
        setDepartments([
          { id: 1, name: "Cardiology", description: "Heart and cardiovascular care", headDoctor: "Dr. Abebe Kebede", phone: "+251911223344", floor: "3rd Floor", isActive: true },
          { id: 2, name: "Pediatrics", description: "Child health care", headDoctor: "Dr. Sara Hailu", phone: "+251911334455", floor: "2nd Floor", isActive: true },
          { id: 3, name: "Orthopedics", description: "Bone and joint care", headDoctor: "Dr. Dawit Tesfa", phone: "+251911445566", floor: "4th Floor", isActive: true },
          { id: 4, name: "Emergency", description: "24/7 emergency services", headDoctor: "Dr. Helen Mengistu", phone: "+251911556677", floor: "Ground Floor", isActive: true },
          { id: 5, name: "Radiology", description: "Imaging and diagnostics", headDoctor: "Dr. Yonas Bekele", phone: "+251911667788", floor: "1st Floor", isActive: false },
        ]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoadingDepts(false);
    }
  };

  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await apiGetServices();
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        // Mock data
        setServices([
          { id: 1, name: "General Consultation", description: "Basic health checkup", price: 500, duration: "30 min", department: "General", isAvailable: true },
          { id: 2, name: "ECG Test", description: "Heart rhythm monitoring", price: 800, duration: "20 min", department: "Cardiology", isAvailable: true },
          { id: 3, name: "X-Ray", description: "Radiographic imaging", price: 600, duration: "15 min", department: "Radiology", isAvailable: true },
          { id: 4, name: "Blood Test", description: "Complete blood count", price: 350, duration: "10 min", department: "Laboratory", isAvailable: true },
          { id: 5, name: "Ultrasound", description: "Ultrasound imaging", price: 1200, duration: "30 min", department: "Radiology", isAvailable: false },
        ]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Filter functions
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchDeptQuery.toLowerCase()) ||
      dept.headDoctor?.toLowerCase().includes(searchDeptQuery.toLowerCase())
  );

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchServiceQuery.toLowerCase()) ||
      service.department?.toLowerCase().includes(searchServiceQuery.toLowerCase())
  );

  // --- Department Handlers ---
  const handleAddDepartment = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiAddDepartment(deptForm);
      if (response.success) {
        fetchDepartments();
        setShowAddDeptModal(false);
        resetDeptForm();
      } else {
        // Add locally for demo
        setDepartments([...departments, { ...deptForm, id: Date.now() }]);
        setShowAddDeptModal(false);
        resetDeptForm();
      }
    } catch (error) {
      console.error("Error adding department:", error);
      setDepartments([...departments, { ...deptForm, id: Date.now() }]);
      setShowAddDeptModal(false);
      resetDeptForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      const response = await apiUpdateDepartment(selectedDept.id, deptForm);
      if (response.success) {
        fetchDepartments();
      } else {
        setDepartments(departments.map((d) => (d.id === selectedDept.id ? { ...d, ...deptForm } : d)));
      }
      setShowEditDeptModal(false);
      setSelectedDept(null);
      resetDeptForm();
    } catch (error) {
      console.error("Error updating department:", error);
      setDepartments(departments.map((d) => (d.id === selectedDept.id ? { ...d, ...deptForm } : d)));
      setShowEditDeptModal(false);
      setSelectedDept(null);
      resetDeptForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      await apiDeleteDepartment(selectedDept.id);
      setDepartments(departments.filter((d) => d.id !== selectedDept.id));
      setShowDeleteDeptModal(false);
      setSelectedDept(null);
    } catch (error) {
      console.error("Error deleting department:", error);
      setDepartments(departments.filter((d) => d.id !== selectedDept.id));
      setShowDeleteDeptModal(false);
      setSelectedDept(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Service Handlers ---
  const handleAddService = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiAddService(serviceForm);
      if (response.success) {
        fetchServices();
        setShowAddServiceModal(false);
        resetServiceForm();
      } else {
        setServices([...services, { ...serviceForm, id: Date.now() }]);
        setShowAddServiceModal(false);
        resetServiceForm();
      }
    } catch (error) {
      console.error("Error adding service:", error);
      setServices([...services, { ...serviceForm, id: Date.now() }]);
      setShowAddServiceModal(false);
      resetServiceForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const response = await apiUpdateService(selectedService.id, serviceForm);
      if (response.success) {
        fetchServices();
      } else {
        setServices(services.map((s) => (s.id === selectedService.id ? { ...s, ...serviceForm } : s)));
      }
      setShowEditServiceModal(false);
      setSelectedService(null);
      resetServiceForm();
    } catch (error) {
      console.error("Error updating service:", error);
      setServices(services.map((s) => (s.id === selectedService.id ? { ...s, ...serviceForm } : s)));
      setShowEditServiceModal(false);
      setSelectedService(null);
      resetServiceForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      await apiDeleteService(selectedService.id);
      setServices(services.filter((s) => s.id !== selectedService.id));
      setShowDeleteServiceModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      setServices(services.filter((s) => s.id !== selectedService.id));
      setShowDeleteServiceModal(false);
      setSelectedService(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reset Forms ---
  const resetDeptForm = () => {
    setDeptForm({ name: "", description: "", headDoctor: "", phone: "", floor: "", isActive: true });
  };

  const resetServiceForm = () => {
    setServiceForm({ name: "", description: "", price: "", duration: "", department: "", isAvailable: true });
  };

  // --- Open Edit/Delete Modals ---
  const openEditDeptModal = (dept) => {
    setSelectedDept(dept);
    setDeptForm({
      name: dept.name,
      description: dept.description || "",
      headDoctor: dept.headDoctor || "",
      phone: dept.phone || "",
      floor: dept.floor || "",
      isActive: dept.isActive,
    });
    setShowEditDeptModal(true);
  };

  const openEditServiceModal = (service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price || "",
      duration: service.duration || "",
      department: service.department || "",
      isAvailable: service.isAvailable,
    });
    setShowEditServiceModal(true);
  };

  return (
    <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <nav className={`fixed sm:relative inset-y-0 left-0 z-40 w-16 sm:w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-400 dark:border-gray-500 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
        <div className="p-3 sm:p-6 flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shrink-0">
              <Building2 size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="hidden lg:block font-bold text-lg sm:text-xl tracking-tight">
              Hospital<span className="text-blue-600">Hub</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 -mr-2" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<Layers size={20} />}
            label="Departments"
            active={activeTab === "departments"}
            onClick={() => setActiveTab("departments")}
          />
          <NavItem
            icon={<Stethoscope size={20} />}
            label="Services"
            active={activeTab === "services"}
            onClick={() => setActiveTab("services")}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>

        <div className="p-4 border-t border-gray-400 dark:border-gray-500">
          <div className="hidden lg:flex items-center gap-3 p-3 bg-slate-100 dark:bg-gray-700 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs">
              SG
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">St. Gabriel Admin</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">Hospital Manager</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* HEADER */}
        <header className="h-14 sm:h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-400 dark:border-gray-500 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 shrink-0" aria-label="Open menu">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0" title="Back to Home">
              <ChevronLeft size={20} />
            </a>
            <h2 className="text-base sm:text-xl font-bold capitalize truncate">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {/* <LanguageSwitcher /> */}
            <ThemeToggle />
            {profile.providesEmergency && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200">
                <Heart size={14} className="animate-pulse" />
                Emergency Available
              </div>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${profile.isPublic
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200"
                : "bg-red-50 text-red-600 border-red-200"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${profile.isPublic ? "bg-blue-500 animate-pulse" : "bg-red-500"
                  }`}
              ></span>
              {profile.isPublic ? "Live on Map" : "Hidden"}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Departments"
                    value={departments.length.toString()}
                    trend={`${departments.filter((d) => d.isActive).length} active`}
                    icon={<Layers />}
                    color="blue"
                  />
                  <StatCard
                    title="Services"
                    value={services.length.toString()}
                    trend={`${services.filter((s) => s.isAvailable).length} available`}
                    icon={<Stethoscope />}
                    color="emerald"
                  />
                  <StatCard
                    title="AI Inquiries"
                    value="234"
                    trend="92% resolved"
                    icon={<Activity />}
                    color="purple"
                  />
                  <StatCard
                    title="Patient Queries"
                    value="89"
                    trend="Today"
                    icon={<Users />}
                    color="orange"
                  />
                </div>

                {/* Departments + Recent Chats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Departments Overview */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg">Active Departments</h3>
                      <button
                        onClick={() => setActiveTab("departments")}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {departments
                        .filter((d) => d.isActive)
                        .slice(0, 5)
                        .map((dept) => (
                          <div
                            key={dept.id}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700/30 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Building2 size={16} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{dept.name}</p>
                                <p className="text-[10px] text-slate-500">{dept.headDoctor}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{dept.floor}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Recent Chats */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-500" />
                      Recent Inquiries
                    </h3>
                    <div className="space-y-4">
                      {recentChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-4 rounded-2xl ${chat.status === "unread"
                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                            : "bg-slate-50 dark:bg-gray-700/30"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold">{chat.user}</p>
                            <span className="text-[10px] text-slate-400">{chat.time}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-gray-400 truncate">
                            {chat.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DEPARTMENTS TAB */}
            {activeTab === "departments" && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search departments..."
                      value={searchDeptQuery}
                      onChange={(e) => setSearchDeptQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      resetDeptForm();
                      setShowAddDeptModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Plus size={18} />
                    Add Department
                  </button>
                </div>

                {isLoadingDepts ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-gray-900/50">
                          <tr className="text-[11px] uppercase text-slate-400 border-b dark:border-gray-700">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Head Doctor</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700 text-sm">
                          {filteredDepartments.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                No departments found
                              </td>
                            </tr>
                          ) : (
                            filteredDepartments.map((dept) => (
                              <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">#{dept.id}</td>
                                <td className="px-6 py-4">
                                  <p className="font-bold">{dept.name}</p>
                                  <p className="text-[10px] text-slate-400">{dept.description}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-gray-400">{dept.headDoctor || "N/A"}</td>
                                <td className="px-6 py-4 text-xs text-slate-500">{dept.floor || "N/A"}</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-bold ${dept.isActive
                                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                      : "bg-slate-100 text-slate-500 dark:bg-gray-700"
                                      }`}
                                  >
                                    {dept.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => openEditDeptModal(dept)}
                                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedDept(dept);
                                        setShowDeleteDeptModal(true);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SERVICES TAB */}
            {activeTab === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchServiceQuery}
                      onChange={(e) => setSearchServiceQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      resetServiceForm();
                      setShowAddServiceModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Plus size={18} />
                    Add Service
                  </button>
                </div>

                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-gray-900/50">
                          <tr className="text-[11px] uppercase text-slate-400 border-b dark:border-gray-700">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Price (ETB)</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700 text-sm">
                          {filteredServices.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                No services found
                              </td>
                            </tr>
                          ) : (
                            filteredServices.map((service) => (
                              <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">#{service.id}</td>
                                <td className="px-6 py-4">
                                  <p className="font-bold">{service.name}</p>
                                  <p className="text-[10px] text-slate-400">{service.description}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-gray-400">{service.department || "General"}</td>
                                <td className="px-6 py-4 font-bold text-emerald-600">{service.price || "N/A"}</td>
                                <td className="px-6 py-4 text-xs text-slate-500">{service.duration || "N/A"}</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-bold ${service.isAvailable
                                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                      : "bg-slate-100 text-slate-500 dark:bg-gray-700"
                                      }`}
                                  >
                                    {service.isAvailable ? "Available" : "Unavailable"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => openEditServiceModal(service)}
                                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedService(service);
                                        setShowDeleteServiceModal(true);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl space-y-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 border-2 border-dashed border-blue-300">
                      <Camera size={24} />
                    </div>
                    <h3 className="text-xl font-bold">Hospital Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Hospital Name"
                      icon={<Building2 size={14} />}
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                    <InputGroup
                      label="Email"
                      icon={<Globe size={14} />}
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                    <InputGroup
                      label="Phone"
                      icon={<Phone size={14} />}
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                    <InputGroup
                      label="Address"
                      icon={<Building2 size={14} />}
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <ThemeToggle />
                  <button className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <Save size={18} /> Update Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* DEPARTMENT MODALS */}
      <AnimatePresence>
        {showAddDeptModal && (
          <DepartmentModal
            title="Add Department"
            form={deptForm}
            setForm={setDeptForm}
            onSubmit={handleAddDepartment}
            onClose={() => setShowAddDeptModal(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Department"
          />
        )}
        {showEditDeptModal && (
          <DepartmentModal
            title="Edit Department"
            form={deptForm}
            setForm={setDeptForm}
            onSubmit={handleEditDepartment}
            onClose={() => {
              setShowEditDeptModal(false);
              setSelectedDept(null);
            }}
            isSubmitting={isSubmitting}
            submitLabel="Update Department"
          />
        )}
        {showDeleteDeptModal && selectedDept && (
          <DeleteConfirmModal
            itemName={selectedDept.name}
            itemType="department"
            onConfirm={handleDeleteDepartment}
            onClose={() => {
              setShowDeleteDeptModal(false);
              setSelectedDept(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* SERVICE MODALS */}
      <AnimatePresence>
        {showAddServiceModal && (
          <ServiceModal
            title="Add Service"
            form={serviceForm}
            setForm={setServiceForm}
            departments={departments}
            onSubmit={handleAddService}
            onClose={() => setShowAddServiceModal(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Service"
          />
        )}
        {showEditServiceModal && (
          <ServiceModal
            title="Edit Service"
            form={serviceForm}
            setForm={setServiceForm}
            departments={departments}
            onSubmit={handleEditService}
            onClose={() => {
              setShowEditServiceModal(false);
              setSelectedService(null);
            }}
            isSubmitting={isSubmitting}
            submitLabel="Update Service"
          />
        )}
        {showDeleteServiceModal && selectedService && (
          <DeleteConfirmModal
            itemName={selectedService.name}
            itemType="service"
            onConfirm={handleDeleteService}
            onClose={() => {
              setShowDeleteServiceModal(false);
              setSelectedService(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Department Modal ---
const DepartmentModal = ({ title, form, setForm, onSubmit, onClose, isSubmitting, submitLabel }) => {
  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Layers size={20} className="text-blue-500" />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Department Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g., Cardiology"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Brief description of the department"
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Head Doctor</label>
              <input
                type="text"
                value={form.headDoctor}
                onChange={handleChange("headDoctor")}
                placeholder="e.g., Dr. Abebe"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="+251..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Floor/Location</label>
            <input
              type="text"
              value={form.floor}
              onChange={handleChange("floor")}
              placeholder="e.g., 3rd Floor"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange("isActive")}
              className="w-5 h-5 rounded border-gray-400 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm">Department is Active</span>
          </label>
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !form.name}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Service Modal ---
const ServiceModal = ({ title, form, setForm, departments, onSubmit, onClose, isSubmitting, submitLabel }) => {
  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Stethoscope size={20} className="text-blue-500" />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Service Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g., ECG Test"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Brief description of the service"
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Price (ETB)</label>
              <input
                type="number"
                value={form.price}
                onChange={handleChange("price")}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={handleChange("duration")}
                placeholder="e.g., 30 min"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
            <select
              value={form.department}
              onChange={handleChange("department")}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Select Department</option>
              <option value="General">General</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={handleChange("isAvailable")}
              className="w-5 h-5 rounded border-gray-400 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm">Service is Available</span>
          </label>
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !form.name}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmModal = ({ itemName, itemType, onConfirm, onClose, isSubmitting }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Delete {itemType}</h3>
        <p className="text-slate-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// --- Subcomponents ---
const StatCard = ({ title, value, trend, icon, color }) => {
  const colorVariants = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-400 dark:border-gray-500">
      <div className={`p-3 w-fit rounded-xl mb-4 ${colorVariants[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs font-bold text-slate-500 uppercase">{title}</p>
      <p className="text-[10px] mt-1 text-blue-500 font-bold">{trend}</p>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${active
      ? "bg-blue-600 text-white shadow-lg"
      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700"
      }`}
  >
    {icon}
    <span className="hidden lg:block font-bold text-sm">{label}</span>
  </button>
);

const InputGroup = ({ label, icon, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      className="w-full p-3 bg-slate-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default HospitalDashboard;
