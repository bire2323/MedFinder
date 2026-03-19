import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Heart, History, LogOut, MessageSquare, User, Search } from "lucide-react";

import useAuthStore from "../../store/UserAuthStore";
import { apiLogout } from "../../api/auth";

import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import Profile from "./components/Profile";
import Chat from "./components/Chat";
import Header from "../../component/Header";

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

function normalizeFacilityForStorage(facility) {
    if (!facility) return null;
    const type = facility.type === "hospital" || facility.type === "pharmacy" ? facility.type : facility.type ? String(facility.type) : "facility";
    return {
        type,
        id: facility.id,
        name: facility.name ?? facility.raw?.name ?? "Facility",
        address: facility.address ?? "",
        lat: facility.lat ?? facility.latitude ?? null,
        lng: facility.lng ?? facility.longitude ?? null,
    };
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const { user, clearSession } = useAuthStore();

    const [activeSection, setActiveSection] = useState("home"); // home | search | favorites | messages | profile
    const [favorites, setFavorites] = useState([]);
    const [recents, setRecents] = useState([]);

    const [chatTargetFacility, setChatTargetFacility] = useState(null);
    const [chatTargetNonce, setChatTargetNonce] = useState(0);

    useEffect(() => {
        setFavorites(safeParseJSON(localStorage.getItem(LS_FAVORITES_KEY), []));
        setRecents(safeParseJSON(localStorage.getItem(LS_RECENTS_KEY), []));
    }, []);

    useEffect(() => {
        localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem(LS_RECENTS_KEY, JSON.stringify(recents));
    }, [recents]);

    const favoritesSet = useMemo(() => {
        const m = new Map();
        for (const f of favorites) {
            if (!f) continue;
            m.set(`${f.type}:${String(f.id)}`, true);
        }
        return m;
    }, [favorites]);

    const isFavorite = (facility) => {
        const n = normalizeFacilityForStorage(facility);
        if (!n) return false;
        return favoritesSet.has(`${n.type}:${String(n.id)}`);
    };

    const toggleFavorite = (facility) => {
        const normalized = normalizeFacilityForStorage(facility);
        if (!normalized) return;

        setFavorites((prev) => {
            const exists = prev.some((p) => isSameFacility(p, normalized));
            if (exists) return prev.filter((p) => !isSameFacility(p, normalized));
            return [normalized, ...prev].slice(0, 50);
        });
    };

    const addRecent = (facility) => {
        const normalized = normalizeFacilityForStorage(facility);
        if (!normalized) return;

        setRecents((prev) => {
            const filtered = prev.filter((p) => !isSameFacility(p, normalized));
            return [normalized, ...filtered].slice(0, 5);
        });
    };

    const openFacilityInMapAndRoute = (facility) => {
        addRecent(facility);
        setActiveSection("search");
    };

    const requestChatWithFacility = (facility) => {
        addRecent(facility);
        setChatTargetFacility(normalizeFacilityForStorage(facility));
        setChatTargetNonce((n) => n + 1);
        setActiveSection("messages");
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
        } finally {
            clearSession();
            navigate("/");
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white text-slate-900 dark:bg-gray-900 dark:text-slate-100 transition-colors duration-300 flex ">

                <Sidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    onLogout={handleLogout}
                    favoritesCount={favorites.length}
                />

                <main className="flex-1 min-w-0 xl:ml-14 flex flex-col overflow-hidden ">
                    <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                {activeSection === "home" ? <ClipboardList size={18} /> : null}
                                {activeSection === "search" ? <Search size={18} /> : null}
                                {activeSection === "favorites" ? <Heart size={18} /> : null}
                                {activeSection === "messages" ? <MessageSquare size={18} /> : null}
                                {activeSection === "profile" ? <User size={18} /> : null}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-extrabold truncate">
                                    {activeSection === "home" && "Overview"}
                                    {activeSection === "search" && "Search & Navigate"}
                                    {activeSection === "favorites" && "Saved Places"}
                                    {activeSection === "messages" && "Messages"}
                                    {activeSection === "profile" && "Profile"}
                                </h1>
                                <p className="text-xs text-slate-600 dark:text-gray-300">
                                    {user?.Name ? `Hi, ${user.Name}` : "Your healthcare dashboard"}
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            {activeSection !== "profile" && (
                                <button
                                    type="button"
                                    onClick={() => setActiveSection("profile")}
                                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 text-sm font-bold"
                                >
                                    Profile
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-3 py-2 rounded-xl bg-red-600/10 text-red-700 dark:text-red-300 dark:bg-red-500/10 hover:bg-red-600/15 text-sm font-bold flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>

                    <section className="flex-1 overflow-y-auto">
                        {activeSection === "home" && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    <div className="lg:col-span-7 bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-5">
                                        <h2 className="text-base font-extrabold mb-1">Recent Views</h2>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
                                            Tap any facility to re-open it and draw a route.
                                        </p>

                                        {recents.length === 0 ? (
                                            <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-6 text-center bg-slate-50 dark:bg-gray-900/40">
                                                <p className="font-extrabold text-slate-800 dark:text-slate-100">No recents yet</p>
                                                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                                                    Your last viewed hospitals and pharmacies will show here.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSection("search")}
                                                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700"
                                                >
                                                    <History size={16} />
                                                    Explore nearest facilities
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {recents.map((f) => (
                                                    <button
                                                        key={`${f.type}:${String(f.id)}`}
                                                        type="button"
                                                        onClick={() => openFacilityInMapAndRoute(f)}
                                                        className="text-left border border-slate-200 dark:border-gray-700 rounded-2xl p-4 hover:bg-slate-50 shadow-sm dark:hover:bg-gray-800/60 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="font-extrabold truncate">{f.name}</p>
                                                                <p className="text-xs text-slate-600 dark:text-gray-300 truncate">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</p>
                                                                {f.address && (
                                                                    <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate">{f.address}</p>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${f.type === "hospital"
                                                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                                    : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                                                    }`}
                                                            >
                                                                {f.type === "hospital" ? "H" : "P"}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="lg:col-span-5 bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-5">
                                        <h2 className="text-base font-extrabold mb-1">Saved Places</h2>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">Quickly jump back to your favorites.</p>

                                        {favorites.length === 0 ? (
                                            <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-6 text-center bg-slate-50 dark:bg-gray-900/40">
                                                <p className="font-extrabold text-slate-800 dark:text-slate-100">No favorites yet</p>
                                                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Bookmark pharmacies and hospitals as you browse.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSection("search")}
                                                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700"
                                                >
                                                    <Heart size={16} />
                                                    Find facilities
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {favorites.slice(0, 4).map((f) => (
                                                    <button
                                                        key={`${f.type}:${String(f.id)}`}
                                                        type="button"
                                                        onClick={() => openFacilityInMapAndRoute(f)}
                                                        className="w-full text-left shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                                                    >
                                                        <p className="font-extrabold">{f.name}</p>
                                                        <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</p>
                                                    </button>
                                                ))}
                                                {favorites.length > 4 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveSection("favorites")}
                                                        className="mt-2 w-full text-center text-sm font-extrabold text-blue-700 dark:text-blue-400 hover:underline"
                                                    >
                                                        View all favorites ({favorites.length})
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection("search")}
                                        className="bg-white dark:bg-gray-800/40 shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                                    >
                                        <p className="font-extrabold">Facility Search</p>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Find nearest hospitals or pharmacies and draw routes.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection("messages")}
                                        className="bg-white dark:bg-gray-800/40 shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                                    >
                                        <p className="font-extrabold">Real-time Chat</p>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Talk with pharmacy agents about availability and prices.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection("profile")}
                                        className="bg-white dark:bg-gray-800/40 shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                                    >
                                        <p className="font-extrabold">Profile & Security</p>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Update your info, change password, and manage your photo.</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === "search" && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <MapView
                                    favorites={favorites}
                                    isFavorite={isFavorite}
                                    onToggleFavorite={toggleFavorite}
                                    onFacilityViewed={(f) => addRecent(f)}
                                    onRequestChat={(facility) => requestChatWithFacility(facility)}
                                />
                            </div>
                        )}

                        {activeSection === "favorites" && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <div className="flex items-end justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold">Saved Places</h2>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">Your bookmarked hospitals and pharmacies.</p>
                                    </div>
                                </div>

                                {favorites.length === 0 ? (
                                    <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-8 text-center bg-slate-50 dark:bg-gray-900/40">
                                        <p className="font-extrabold text-slate-800 dark:text-slate-100">No favorites yet</p>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Bookmark a facility from Search to see it here.</p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection("search")}
                                            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-extrabold hover:bg-blue-700"
                                        >
                                            <Search size={16} />
                                            Search facilities
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.map((f) => (
                                            <div key={`${f.type}:${String(f.id)}`} className="bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="font-extrabold truncate">{f.name}</p>
                                                        <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</p>
                                                        {f.address && <p className="text-xs text-slate-600 dark:text-gray-300 mt-2 truncate">{f.address}</p>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFavorite(f)}
                                                        className="p-2 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300 hover:bg-blue-600/15 transition-colors"
                                                        aria-label="Remove from favorites"
                                                        title="Remove"
                                                    >
                                                        <Heart size={16} className="fill-current" />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openFacilityInMapAndRoute(f)}
                                                    className="mt-4 w-full rounded-xl bg-blue-600 text-white py-2.5 font-extrabold hover:bg-blue-700 transition-colors"
                                                >
                                                    Open in Search
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === "messages" && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <Chat
                                    key={chatTargetNonce}
                                    initialFacility={chatTargetFacility}
                                    onClearInitialFacility={() => setChatTargetFacility(null)}
                                />
                            </div>
                        )}

                        {activeSection === "profile" && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <Profile />
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>

    );
}