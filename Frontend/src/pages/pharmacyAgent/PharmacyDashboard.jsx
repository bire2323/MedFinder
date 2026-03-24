/**
 * Pharmacy Agent Dashboard
 * Comprehensive dashboard with inventory management, overview stats, and settings
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import useAuthStore from "../../store/UserAuthStore";
import { useNotifications } from "../../hooks/UserNotification";
import useChatNotificationStore from "../../store/useChatNotificationStore";
import NotificationToast from "../../component/NotificationToast";
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
} from "lucide-react";
import ThemeToggle from "../../component/DarkLightTeam";

import Inventory from "./Inventory";
import { apiGetInventory } from "../../api/inventory";
import { apiFetch } from "../../api/client";

// Import Refactored Components
import OverviewTab from "./components/OverviewTab";
import SettingsTab from "./components/SettingsTab";
import ChatsTab from "./components/ChatsTab";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = user?.id;
  
  const { handleIncomingMessage, targetSessionToOpen, getUnreadCount } = useChatNotificationStore();
  const unreadCount = getUnreadCount();

  useNotifications(currentUserId, (incoming) => {
     handleIncomingMessage({
            message: incoming.message,
            senderName: incoming.sender.sender?.Name || `User ${incoming.sender_id}`,
            sessionId: incoming.chat_session_id,
            fullMessage: incoming
        });
  });

  useEffect(() => {
      useChatNotificationStore.getState().loadSessions();
  }, []);

  useEffect(() => {
    if (targetSessionToOpen) {
      setActiveTab("chats");
    }
  }, [targetSessionToOpen]);


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

  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [inventory, setInventory] = useState([]);



  useEffect(() => {
    const fetchInv = async () => {
      try {
        const response = await apiGetInventory();
        if (response) {
          const inventoryData = response.data || response;
          setPharmacyProfile(inventoryData);
          // setInventory(inventoryData.drugs || Array.isArray(inventoryData) ? inventoryData : []);
          console.log('Inventory loaded:', inventoryData.drugs?.length || inventoryData?.length);
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
      <div className="min-h-screen min-w-[320px] bg-slate-50 dark:bg-gray-900 flex text-slate-900 dark:text-gray-100 transition-colors duration-300">
        {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      {/* SIDEBAR - responsive: collapsed on mobile, overlay when open */}
      <nav className={`fixed sm:relative inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
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
            icon={<MessageSquare size={20} />}
            label="Chats"
            active={activeTab === "chats"}
            onClick={() => setActiveTab("chats")}
            badge={unreadCount > 0 ? unreadCount : null}
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
        <header className="h-14 sm:h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-b-gray-200 border-gray-400 dark:border-gray-500 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 shrink-0" aria-label="Open menu">
              <MenuIcon size={20} />
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
              <OverviewTab inventory={inventory} recentChats={recentChats} setActiveTab={setActiveTab} />
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <Inventory activeTab={activeTab} setActiveTab={setActiveTab} />

            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <SettingsTab profile={profile} setProfile={setProfile} />
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
