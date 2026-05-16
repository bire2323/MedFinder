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
            <Header />
            <NotificationToast />
            <div className="min-h-screen px-4 sm:px-6 xl:px-10 bg-white text-slate-900 dark:bg-gray-900 dark:text-slate-100 transition-colors duration-300 flex ">
                <Sidebar
                    onLogout={handleLogout}
                    favoritesCount={favorites.length}
                    unreadCount={unreadCount}
                />

                <main className="flex-1 min-w-0 xl:ml-14 flex flex-col overflow-hidden ">
                    <div className="sticky top-0 z-[90] flex items-center justify-between px-4 sm:px-6 lg:px-8 py- sm:py:2 md:py-4 border-b border-slate-100 dark:border-gray-800">
                        <button onClick={() => navigate("/")}>
                            <ChevronLeft className="hidden md:block cursor-pointer text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-50" />
                        </button>

                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-6 h-6 md:w-9 md:h-9 rounded-xl bg-green-700 text-white flex items-center justify-center shadow-sm">
                                {activeSection === "overview" || activeSection === "dashboard" ? <ClipboardList size={18} /> : null}
                                {activeSection === "search" ? <Search size={18} /> : null}
                                {activeSection === "favorites" ? <Heart size={18} /> : null}
                                {activeSection === "messages" ? <MessageSquare size={18} /> : null}
                                {activeSection === "profile" ? <User size={18} /> : null}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-[10px] md:text-lg sm:text-xl font-bold truncate">
                                    {(activeSection === "overview" || activeSection === "dashboard") && t("UserDashboard.Overview")}
                                    {activeSection === "search" && t("UserDashboard.SearchAndNavigate")}
                                    {activeSection === "favorites" && t("UserDashboard.SavedPlaces")}
                                    {activeSection === "messages" && t("UserDashboard.Messages")}
                                    {activeSection === "profile" && t("UserDashboard.Profile")}
                                </h1>
                                <p className="text-[9px] md:text-xs text-slate-600 dark:text-gray-300">
                                    {user?.Name ? `${t("UserDashboard.Hi")}, ${user.Name}` : t("UserDashboard.YourHealthcareDashboard")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className="flex-1 overflow-y-auto ">
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