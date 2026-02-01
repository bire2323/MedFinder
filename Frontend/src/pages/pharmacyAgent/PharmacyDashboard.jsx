/**
 * Pharmacy Agent Dashboard
 * Comprehensive dashboard with inventory management, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import ThemeToggle from "../../component/DarkLightTeam";
import {
  apiGetInventory,
  apiAddDrug,
  apiUpdateDrug,
  apiDeleteDrug,
  apiSearchDrugs,
} from "../../api/inventory";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Profile State ---
  const [profile, setProfile] = useState({
    name: "Central Wellness Pharmacy",
    license: "PH-9920-ETH",
    email: "contact@centralwellness.com",
    phone: "+251 911 22 33 44",
    address: "Bole Road, Mega Building, Addis Ababa",
    coordinates: { lat: 9.01, lng: 38.75 },
    openHours: "08:00 AM - 10:00 PM",
    radius: 5,
    isPublic: true,
  });

  // --- Inventory State ---
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);

  // --- Modal States ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form State for Add/Edit ---
  const [drugForm, setDrugForm] = useState({
    name: "",
    genericName: "",
    dosage: "",
    stock: "",
    price: "",
    expiryDate: "",
    rxRequired: false,
  });

  // --- Recent Chats (mock data) ---
  const [recentChats] = useState([
    { id: 1, user: "User123", message: "Do you have Amoxicillin?", time: "10 min ago", status: "unread" },
    { id: 2, user: "User456", message: "What's the price of Panadol?", time: "25 min ago", status: "read" },
    { id: 3, user: "User789", message: "Is Insulin available?", time: "1 hour ago", status: "read" },
  ]);

  // --- Fetch Inventory ---
  useEffect(() => {
    if (activeTab === "inventory" || activeTab === "overview") {
      fetchInventory();
    }
  }, [activeTab]);

  const fetchInventory = async () => {
    setIsLoadingInventory(true);
    setInventoryError(null);
    try {
      const response = await apiGetInventory();
      if (response.success && response.data) {
        setInventory(response.data);
      } else {
        // Use mock data for demonstration
        setInventory([
          {
            id: 101,
            name: "Lipitor",
            genericName: "Atorvastatin",
            dosage: "20mg",
            stock: 450,
            price: 120,
            expiryDate: "2026-12-15",
            bookedDate: "2026-01-15",
            rxRequired: true,
            status: "In Stock",
          },
          {
            id: 102,
            name: "Panadol",
            genericName: "Paracetamol",
            dosage: "500mg",
            stock: 12,
            price: 25,
            expiryDate: "2026-08-20",
            bookedDate: "2026-01-10",
            rxRequired: false,
            status: "Low Stock",
          },
          {
            id: 103,
            name: "Amoxil",
            genericName: "Amoxicillin",
            dosage: "500mg",
            stock: 0,
            price: 85,
            expiryDate: "2026-06-30",
            bookedDate: "2025-12-20",
            rxRequired: true,
            status: "Out of Stock",
          },
          {
            id: 104,
            name: "Metformin",
            genericName: "Metformin HCL",
            dosage: "850mg",
            stock: 230,
            price: 95,
            expiryDate: "2027-03-10",
            bookedDate: "2026-01-20",
            rxRequired: true,
            status: "In Stock",
          },
          {
            id: 105,
            name: "Ibuprofen",
            genericName: "Ibuprofen",
            dosage: "400mg",
            stock: 180,
            price: 35,
            expiryDate: "2026-09-25",
            bookedDate: "2026-01-18",
            rxRequired: false,
            status: "In Stock",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventoryError("Failed to load inventory");
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // --- Search Handler ---
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await apiSearchDrugs(query);
        if (response.success && response.data) {
          setInventory(response.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    } else if (query.length === 0) {
      fetchInventory();
    }
  };

  // Filter inventory based on search
  const filteredInventory = inventory.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Add Drug Handler ---
  const handleAddDrug = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiAddDrug(drugForm);
      if (response.success) {
        fetchInventory();
        setShowAddModal(false);
        resetDrugForm();
      } else {
        alert(response.message || "Failed to add drug");
      }
    } catch (error) {
      console.error("Error adding drug:", error);
      alert("Failed to add drug. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Edit Drug Handler ---
  const handleEditDrug = async () => {
    if (!selectedDrug) return;
    setIsSubmitting(true);
    try {
      const response = await apiUpdateDrug(selectedDrug.id, drugForm);
      if (response.success) {
        fetchInventory();
        setShowEditModal(false);
        setSelectedDrug(null);
        resetDrugForm();
      } else {
        alert(response.message || "Failed to update drug");
      }
    } catch (error) {
      console.error("Error updating drug:", error);
      alert("Failed to update drug. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Drug Handler ---
  const handleDeleteDrug = async () => {
    if (!selectedDrug) return;
    setIsSubmitting(true);
    try {
      const response = await apiDeleteDrug(selectedDrug.id);
      if (response.success) {
        // Remove from local state
        setInventory(inventory.filter((d) => d.id !== selectedDrug.id));
        setShowDeleteModal(false);
        setSelectedDrug(null);
      } else {
        alert(response.message || "Failed to delete drug");
      }
    } catch (error) {
      console.error("Error deleting drug:", error);
      // For demo, remove from local state anyway
      setInventory(inventory.filter((d) => d.id !== selectedDrug.id));
      setShowDeleteModal(false);
      setSelectedDrug(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reset Form ---
  const resetDrugForm = () => {
    setDrugForm({
      name: "",
      genericName: "",
      dosage: "",
      stock: "",
      price: "",
      expiryDate: "",
      rxRequired: false,
    });
  };

  // --- Open Edit Modal ---
  const openEditModal = (drug) => {
    setSelectedDrug(drug);
    setDrugForm({
      name: drug.name,
      genericName: drug.genericName,
      dosage: drug.dosage || "",
      stock: drug.stock,
      price: drug.price || "",
      expiryDate: drug.expiryDate || "",
      rxRequired: drug.rxRequired,
    });
    setShowEditModal(true);
  };

  // --- Open Delete Modal ---
  const openDeleteModal = (drug) => {
    setSelectedDrug(drug);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      {/* SIDEBAR - responsive: collapsed on mobile, overlay when open */}
      <nav className={`fixed sm:relative inset-y-0 left-0 z-40 w-16 sm:w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-400 dark:border-gray-500 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
            <Pill size={24} />
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-tight">
            Pharma<span className="text-emerald-600">Sync</span>
          </span>
        </div>

        <div className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<Pill size={20} />}
            label="Inventory"
            active={activeTab === "inventory"}
            onClick={() => setActiveTab("inventory")}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Prescriptions"
            active={activeTab === "rx"}
            onClick={() => setActiveTab("rx")}
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
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
              AP
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">Abebe Pharma</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                Owner Account
              </p>
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
            <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-gray-400 transition-colors">
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${profile.isPublic ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className="hidden sm:inline">{profile.isPublic ? "Live" : "Hidden"}</span>
            </div>
            <LanguageSwitcher />
            <ThemeToggle />
            <button className="p-2 bg-slate-100 dark:bg-gray-700 rounded-xl text-slate-600 dark:text-gray-300">
              <AlertCircle size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-8">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <StatCard
                    title="Total Drugs"
                    value={inventory.length.toString()}
                    trend="+12 this week"
                    icon={<Pill />}
                    color="emerald"
                  />
                  <StatCard
                    title="Low Stock Items"
                    value={inventory.filter((d) => d.stock < 20 && d.stock > 0).length.toString()}
                    trend="Needs attention"
                    icon={<Package />}
                    color="orange"
                  />
                  <StatCard
                    title="Out of Stock"
                    value={inventory.filter((d) => d.stock === 0).length.toString()}
                    trend="Critical"
                    icon={<AlertCircle />}
                    color="red"
                  />
                  <StatCard
                    title="AI Inquiries"
                    value="156"
                    trend="85% solved"
                    icon={<Activity />}
                    color="purple"
                  />
                </div>

                {/* Inventory Overview + Recent Chats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Inventory Overview */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg">Inventory Overview</h3>
                      <button
                        onClick={() => setActiveTab("inventory")}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {inventory.slice(0, 5).map((drug) => (
                        <div
                          key={drug.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700/30 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                              <Pill size={16} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{drug.name}</p>
                              <p className="text-[10px] text-slate-500">{drug.genericName}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              drug.stock === 0
                                ? "bg-red-100 text-red-600"
                                : drug.stock < 20
                                ? "bg-orange-100 text-orange-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {drug.stock} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Chats */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 p-4 sm:p-6 shadow-sm">
                    <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-500" />
                      Recent Chats
                    </h3>
                    <div className="space-y-4">
                      {recentChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-4 rounded-2xl ${
                            chat.status === "unread"
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

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Search and Add */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative w-full min-w-0 sm:w-72">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search drugs..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      resetDrugForm();
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    <Plus size={18} />
                    Add Drug
                  </button>
                </div>

                {/* Inventory Table */}
                {isLoadingInventory ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                  </div>
                ) : inventoryError ? (
                  <div className="text-center py-20 text-red-500">{inventoryError}</div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <table className="w-full text-left min-w-[480px]">
                        <thead className="bg-slate-50 dark:bg-gray-900/50">
                          <tr className="text-[10px] sm:text-[11px] uppercase text-slate-400 border-b border-gray-400 dark:border-gray-500">
                            <th className="px-3 sm:px-6 py-3 sm:py-4">ID</th>
                            <th className="px-6 py-4">Drug Name</th>
                            <th className="px-6 py-4">Generic Name</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Booked Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700 text-sm">
                          {filteredInventory.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                No drugs found
                              </td>
                            </tr>
                          ) : (
                            filteredInventory.map((drug) => (
                              <tr
                                key={drug.id}
                                className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                  #{drug.id}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-bold">{drug.name}</p>
                                  {drug.dosage && (
                                    <p className="text-[10px] text-slate-400">{drug.dosage}</p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-gray-400">
                                  {drug.genericName}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`font-bold ${
                                      drug.stock === 0
                                        ? "text-red-500"
                                        : drug.stock < 20
                                        ? "text-orange-500"
                                        : "text-emerald-500"
                                    }`}
                                  >
                                    {drug.stock} units
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {drug.bookedDate || "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                      drug.stock === 0
                                        ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                                        : drug.stock < 20
                                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                    }`}
                                  >
                                    {drug.stock === 0
                                      ? "Out of Stock"
                                      : drug.stock < 20
                                      ? "Low Stock"
                                      : "In Stock"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => openEditModal(drug)}
                                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal(drug)}
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 p-4 sm:p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 border-2 border-dashed border-emerald-300">
                      <Camera size={24} />
                    </div>
                    <h3 className="text-xl font-bold">Pharmacy Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Pharmacy Name"
                      icon={<Store size={14} />}
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                    <InputGroup
                      label="Support Email"
                      icon={<Globe size={14} />}
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                    <InputGroup
                      label="Phone"
                      icon={<Phone size={14} />}
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                    />
                    <InputGroup
                      label="Working Hours"
                      icon={<Clock size={14} />}
                      value={profile.openHours}
                      onChange={(e) =>
                        setProfile({ ...profile, openHours: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <ThemeToggle />
                  <button className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                    <Save size={18} /> Update Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* ADD DRUG MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <DrugModal
            title="Add New Drug"
            drugForm={drugForm}
            setDrugForm={setDrugForm}
            onSubmit={handleAddDrug}
            onClose={() => setShowAddModal(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Drug"
          />
        )}
      </AnimatePresence>

      {/* EDIT DRUG MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <DrugModal
            title="Edit Drug"
            drugForm={drugForm}
            setDrugForm={setDrugForm}
            onSubmit={handleEditDrug}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDrug(null);
            }}
            isSubmitting={isSubmitting}
            submitLabel="Update Drug"
          />
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && selectedDrug && (
          <DeleteConfirmModal
            drugName={selectedDrug.name}
            onConfirm={handleDeleteDrug}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedDrug(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Drug Modal Component ---
const DrugModal = ({
  title,
  drugForm,
  setDrugForm,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
}) => {
  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setDrugForm({ ...drugForm, [field]: value });
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
        className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-400 dark:border-gray-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-400 dark:border-gray-500 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Pill size={20} className="text-emerald-500" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Drug Name *</label>
              <input
                type="text"
                value={drugForm.name}
                onChange={handleChange("name")}
                placeholder="e.g., Panadol"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Generic Name *</label>
              <input
                type="text"
                value={drugForm.genericName}
                onChange={handleChange("genericName")}
                placeholder="e.g., Paracetamol"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Dosage</label>
              <input
                type="text"
                value={drugForm.dosage}
                onChange={handleChange("dosage")}
                placeholder="e.g., 500mg"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Stock *</label>
              <input
                type="number"
                value={drugForm.stock}
                onChange={handleChange("stock")}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Price (ETB)</label>
              <input
                type="number"
                value={drugForm.price}
                onChange={handleChange("price")}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
            <input
              type="date"
              value={drugForm.expiryDate}
              onChange={handleChange("expiryDate")}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={drugForm.rxRequired}
              onChange={handleChange("rxRequired")}
              className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm">Prescription Required</span>
          </label>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-400 dark:border-gray-500 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !drugForm.name || !drugForm.genericName}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
const DeleteConfirmModal = ({ drugName, onConfirm, onClose, isSubmitting }) => (
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
      className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-400 dark:border-gray-500"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Delete Drug</h3>
        <p className="text-slate-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{drugName}</strong>? This action cannot be undone.
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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500">
      <div className={`p-3 w-fit rounded-xl mb-4 ${colorVariants[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs font-bold text-slate-500 uppercase">{title}</p>
      <p className="text-[10px] mt-1 text-emerald-500 font-bold">{trend}</p>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
      active
        ? "bg-emerald-600 text-white shadow-lg"
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
      className="w-full p-3 bg-slate-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

export default PharmacyDashboard;
