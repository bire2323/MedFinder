/**
 * Pharmacy Agent Dashboard
 * Comprehensive dashboard with inventory management, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "../../component/LanguageSwitcher";
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

import Inventory from "./Inventory";

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





  // --- Recent Chats (mock data) ---
  const [recentChats] = useState([
    { id: 1, user: "User123", message: "Do you have Amoxicillin?", time: "10 min ago", status: "unread" },
    { id: 2, user: "User456", message: "What's the price of Panadol?", time: "25 min ago", status: "read" },
    { id: 3, user: "User789", message: "Is Insulin available?", time: "1 hour ago", status: "read" },
  ]);









  const [inventory, setInventory] = useState([]);
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
                            className={`text-xs font-bold px-2 py-1 rounded-lg ${drug.stock === 0
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

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <Inventory activeTab={activeTab} setActiveTab={setActiveTab} />
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


    </div>
  );
};

// --- Drug Modal Component ---




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
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${active
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
