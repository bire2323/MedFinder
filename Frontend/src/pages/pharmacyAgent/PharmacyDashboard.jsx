import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  FileText,
  BarChart3,
  MapPin,
  AlertCircle,
  Search,
  Filter,
  Settings,
  Store,
  Clock,
  Globe,
  ShieldCheck,
  Camera,
  Save,
  Navigation,
  Phone,
  Activity, // Added this missing import
} from "lucide-react";
import ThemeToggle from "../../component/DarkLightTeam";

const PharmacyDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // Set to overview by default to see cards

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

  const [inventory] = useState([
    {
      id: 101,
      brand: "Lipitor",
      generic: "Atorvastatin",
      dosage: "20mg",
      stock: 450,
      rxRequired: true,
      status: "In Stock",
    },
    {
      id: 102,
      brand: "Panadol",
      generic: "Paracetamol",
      dosage: "500mg",
      stock: 12,
      rxRequired: false,
      status: "Low Stock",
    },
    {
      id: 103,
      brand: "Amoxil",
      generic: "Amoxicillin",
      dosage: "500mg",
      stock: 0,
      rxRequired: true,
      status: "Out of Stock",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* SIDEBAR */}
      <nav className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex flex-col">
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

        <div className="p-4 border-t dark:border-gray-700">
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

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 px-8 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                profile.isPublic
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.isPublic
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></span>
              {profile.isPublic ? "Live on Map" : "Hidden from Map"}
            </div>
            <button className="p-2 bg-slate-100 dark:bg-gray-700 rounded-xl text-slate-600 dark:text-gray-300">
              <AlertCircle size={20} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Available Drugs"
                    value="1,420"
                    trend="+12 New this week"
                    icon={<Pill />}
                    color="emerald"
                  />
                  <StatCard
                    title="Map Views"
                    value="3,842"
                    trend="+15.4%"
                    icon={<Navigation />}
                    color="blue"
                  />
                  <StatCard
                    title="AI Inquiries"
                    value="156"
                    trend="85% solved"
                    icon={<Activity />}
                    color="purple"
                  />
                  <StatCard
                    title="Pending Rx"
                    value="14"
                    trend="4 urgent"
                    icon={<FileText />}
                    color="orange"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">
                      Local Demand Trends
                    </h3>
                    <div className="space-y-4">
                      <DemandItem
                        name="Amoxicillin 500mg"
                        searches={450}
                        availability={0}
                      />
                      <DemandItem
                        name="Insulin Glargine"
                        searches={320}
                        availability={85}
                      />
                      <DemandItem
                        name="Paracetamol"
                        searches={1200}
                        availability={100}
                      />
                    </div>
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center gap-4">
                      <AlertCircle className="text-blue-600" size={24} />
                      <p className="text-sm">
                        High demand for <b>Amoxicillin</b> in your area, but
                        your stock is 0.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Critical Alerts</h3>
                    <div className="space-y-4">
                      <AlertItem
                        icon={<AlertCircle className="text-red-500" />}
                        title="Expired Stock"
                        desc="3 Batches of Ibuprofen"
                      />
                      <AlertItem
                        icon={<Pill className="text-orange-500" />}
                        title="Low Stock"
                        desc="Panadol - 12 units left"
                      />
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
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-72">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search drug inventory..."
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold">
                    + Add Drug
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-gray-900/50">
                      <tr className="text-[11px] uppercase text-slate-400 border-b dark:border-gray-700">
                        <th className="px-6 py-4">Brand / Generic</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Requirement</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 text-sm">
                      {inventory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-6 py-4">
                            <b>{item.brand}</b>
                            <p className="text-xs opacity-60">{item.generic}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-lg font-bold ${
                                item.status === "In Stock"
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              {item.stock} Units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {item.rxRequired ? "Prescription" : "OTC"}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-500">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-8">
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
                    />
                    <InputGroup
                      label="Support Email"
                      icon={<Globe size={14} />}
                      value={profile.email}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <ThemeToggle />
                  <button className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2">
                    <Save size={18} /> Update System
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

// --- Subcomponents ---

const StatCard = ({ title, value, trend, icon, color }) => {
  const colorVariants = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-200 dark:border-gray-700">
      <div className={`p-3 w-fit rounded-xl mb-4 ${colorVariants[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs font-bold text-slate-500 uppercase">{title}</p>
      <p className="text-[10px] mt-1 text-emerald-500 font-bold">{trend}</p>
    </div>
  );
};

const DemandItem = ({ name, searches, availability }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700/30 rounded-2xl">
    <div>
      <p className="font-bold text-sm">{name}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase">
        {searches} searches nearby
      </p>
    </div>
    <p
      className={`text-xs font-black ${
        availability > 0 ? "text-emerald-500" : "text-red-500"
      }`}
    >
      {availability}% Stock
    </p>
  </div>
);

const AlertItem = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-gray-700/30 rounded-2xl">
    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs font-bold">{title}</p>
      <p className="text-[10px] text-slate-500">{desc}</p>
    </div>
  </div>
);

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

const InputGroup = ({ label, icon, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      defaultValue={value}
      className="w-full p-3 bg-slate-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none"
    />
  </div>
);

export default PharmacyDashboard;
