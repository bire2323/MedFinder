import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, Heart, LogOut, MessageSquare, User, Search, ChevronLeft } from "lucide-react";

import useAuthStore from "../../store/UserAuthStore";
import { apiLogout } from "../../api/auth";

import Sidebar from "./components/Sidebar";
import Header from "../../component/Header";
import NotificationToast from "../../component/NotificationToast";
import useChatNotificationStore from "../../store/useChatNotificationStore";
import { useNotifications } from "../../hooks/UserNotification";
import AlertModal from "../../component/SupportiveComponent/AlertModal";

const LS_FAVORITES_KEY = "medfinder_favorites_v1";
const LS_RECENTS_KEY = "medfinder_recents_v1";

function safeParseJSON(value, fallback) {
    try {
        if (!value) return fallback;
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function isSameFacility(a, b) {
    if (!a || !b) return false;
    return a.type === b.type && String(a.id) === String(b.id);
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { user, clearSession, roles } = useAuthStore();
    const currentUserId = user?.id;
    const [showModal, setShowModal] = useState(false);

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
        if (roles.includes("patient") || roles.includes("admin")) {
            useChatNotificationStore.getState().loadSessions();
        } else {
            navigate("/");
        }
    }, [user, roles, navigate]);

    useEffect(() => {
        if (targetSessionToOpen) {
            navigate("/user/dashboard/messages");
        }
    }, [targetSessionToOpen, navigate]);

    const [favorites, setFavorites] = useState([]);
    const [recents, setRecents] = useState([]);

    const [chatTargetFacility, setChatTargetFacility] = useState(null);
    const [chatTargetNonce, setChatTargetNonce] = useState(0);

    useEffect(() => {
        setFavorites(safeParseJSON(localStorage.getItem(LS_FAVORITES_KEY), []));
        setRecents(safeParseJSON(localStorage.getItem(LS_RECENTS_KEY), []));

        const params = new URLSearchParams(location.search);
        const sessionId = location.state?.openChatSessionId || params.get("session");
        if (sessionId) {
            navigate("/user/dashboard/messages");
        }
    }, [location.search, location.state, navigate]);

    const addRecent = (facility) => {
        setRecents((prev) => {
            const filtered = prev.filter((f) => !isSameFacility(f, facility));
            const next = [facility, ...filtered].slice(0, 8);
            localStorage.setItem(LS_RECENTS_KEY, JSON.stringify(next));
            return next;
        });
    };

    const toggleFavorite = (facility) => {
        setFavorites((prev) => {
            const exists = prev.some((f) => isSameFacility(f, facility));
            let next;
            if (exists) next = prev.filter((f) => !isSameFacility(f, facility));
            else next = [facility, ...prev];
            localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(next));
            return next;
        });
    };

    const isFavorite = (facility) => {
        return favorites.some((f) => isSameFacility(f, facility));
    };

    const openFacilityInMapAndRoute = (facility) => {
        navigate(`/user/dashboard/search?lat=${facility.lat}&lng=${facility.lng}&name=${encodeURIComponent(facility.name)}`);
    };

    const requestChatWithFacility = (facility) => {
        setChatTargetFacility(facility);
        setChatTargetNonce((n) => n + 1);
        navigate("/user/dashboard/messages");
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
        } finally {
            clearSession();
            navigate("/");
        }
    };

    const activeSection = location.pathname.split("/").pop();

    return (
        <>
            <div>
                {showModal && <AlertModal onClose={() => {
                    setShowModal(false);
                    navigate('/');
                }} />}
            </div>
            {/* <Header /> */}
            <NotificationToast />
            <div className="min-h-screen bg-slate-50/50 text-slate-900 dark:bg-gray-900 dark:text-slate-100 transition-colors duration-300 flex">
                <Sidebar
                    onLogout={handleLogout}
                    favoritesCount={favorites.length}
                    unreadCount={unreadCount}
                />

                <main className="flex-1 min-w-0 flex flex-col overflow-hidden lg:pl-6">
                    <div className="sticky top-0 z-[40] flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-slate-100 dark:border-gray-900 shadow-sm">
                        <div className="flex items-center gap-4 min-w-0">
                            <button
                                onClick={() => navigate("/")}
                                className="p-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-slate-300 transition-all border border-slate-100 dark:border-gray-800/80 shadow-sm hover:scale-105"
                                title={t("Common.Back")}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                                    {(activeSection === "overview" || activeSection === "dashboard") && <ClipboardList size={18} />}
                                    {activeSection === "search" && <Search size={18} />}
                                    {activeSection === "favorites" && <Heart size={18} />}
                                    {activeSection === "messages" && <MessageSquare size={18} />}
                                    {activeSection === "profile" && <User size={18} />}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
                                        {(activeSection === "overview" || activeSection === "dashboard") && t("UserDashboard.Overview")}
                                        {activeSection === "search" && t("UserDashboard.SearchAndNavigate")}
                                        {activeSection === "favorites" && t("UserDashboard.SavedPlaces")}
                                        {activeSection === "messages" && t("UserDashboard.Messages")}
                                        {activeSection === "prescription" && t("UserDashboard.Prescription")}
                                        {activeSection === "profile" && t("UserDashboard.Profile")}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-700 dark:text-gray-200">
                                    {user?.Name ? `${t("UserDashboard.Hi")}, ${user.Name}` : t("UserDashboard.YourHealthcareDashboard")}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500">
                                    {user?.email || ""}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/10 select-none">
                                {user?.Name ? user.Name.charAt(0).toUpperCase() : "U"}
                            </div>
                        </div>
                    </div>

                    <section className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-gray-900/10">
                        <Outlet context={{
                            favorites,
                            recents,
                            toggleFavorite,
                            isFavorite,
                            addRecent,
                            openFacilityInMapAndRoute,
                            requestChatWithFacility,
                            chatTargetFacility,
                            chatTargetNonce,
                            setChatTargetFacility
                        }} />
                    </section>
                </main>
            </div>
        </>
    );
}