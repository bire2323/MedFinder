import React from "react";
import { useTranslation } from "react-i18next";
import { History, Search, MessageSquare, User, Heart, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/UserAuthStore";

export default function UserOverview() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { recents, favorites, openFacilityInMapAndRoute } = useOutletContext();

    return (
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Elegant Welcome Banner with Stats */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-transparent border border-emerald-500/10 dark:border-emerald-500/5 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="space-y-2 text-center md:text-left min-w-0 z-10">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        {user?.Name ? `${t("UserDashboard.Hi")}, ${user.Name}` : t("UserDashboard.YourHealthcareDashboard")}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-gray-300 max-w-xl">
                        {t("UserDashboard.TapAnyFacility") ? t("UserDashboard.TapAnyFacility") : "Find the nearest pharmacies and hospitals, navigate to them effortlessly, or start a secure chat session directly with their agents."}
                    </p>
                </div>
                
                <div className="flex gap-4 shrink-0 z-10">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-slate-100 dark:border-gray-700/60 px-5 py-4 rounded-2xl text-center shadow-sm min-w-[100px]">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{favorites.length}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-gray-500 mt-1">{t("UserDashboard.SavedPlaces")}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-slate-100 dark:border-gray-700/60 px-5 py-4 rounded-2xl text-center shadow-sm min-w-[100px]">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{recents.length}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-gray-500 mt-1">{t("UserDashboard.RecentViews")}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Views Card */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-950/40 border border-slate-100 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <History size={16} className="text-emerald-500" />
                                {t("UserDashboard.RecentViews")}
                            </h2>
                        </div>
                    </div>

                    {recents.length === 0 ? (
                        <div className="border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-gray-900/10 flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <History size={22} />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-700 dark:text-slate-200">{t("UserDashboard.NoRecentsYet")}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                                    {t("UserDashboard.YourLastViewed")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/user/dashboard/search")}
                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/10 transition-all hover:scale-102"
                            >
                                <Search size={14} />
                                {t("UserDashboard.ExploreNearest")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {recents.map((f) => (
                                <button
                                    key={`${f.type}:${String(f.id)}`}
                                    type="button"
                                    onClick={() => openFacilityInMapAndRoute(f)}
                                    className="group text-left border border-slate-100 dark:border-gray-900 bg-white/50 dark:bg-gray-900/30 rounded-2xl p-4 hover:bg-white dark:hover:bg-gray-800/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4"
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{f.name}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-gray-500">
                                            {f.type === "hospital" ? t("Map.hospital") : t("Map.pharmacy")}
                                        </p>
                                        {f.address && (
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                <MapPin size={12} className="shrink-0" />
                                                <span>{f.address}</span>
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${f.type === "hospital"
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                            }`}
                                    >
                                        {f.type === "hospital" ? "H" : "P"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Saved Places Card */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-950/40 border border-slate-100 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Heart size={16} className="text-rose-500 fill-current" />
                            {t("UserDashboard.SavedPlaces")}
                        </h2>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-gray-900/10 flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Heart size={22} />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-700 dark:text-slate-200">{t("UserDashboard.NoFavoritesYet")}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                                    {t("UserDashboard.BookmarkPharmacies")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/user/dashboard/search")}
                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/10 transition-all hover:scale-102"
                            >
                                <Search size={14} />
                                {t("UserDashboard.FindFacilities")}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {favorites.slice(0, 4).map((f) => (
                                <button
                                    key={`${f.type}:${String(f.id)}`}
                                    type="button"
                                    onClick={() => openFacilityInMapAndRoute(f)}
                                    className="group w-full text-left border border-slate-100 dark:border-gray-900 bg-white/50 dark:bg-gray-900/30 rounded-2xl p-4 hover:bg-white dark:hover:bg-gray-800/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4"
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{f.name}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-gray-500">
                                            {f.type === "hospital" ? t("Map.hospital") : t("Map.pharmacy")}
                                        </p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            ))}
                            {favorites.length > 4 && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/user/dashboard/favorites")}
                                    className="mt-2 w-full text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                    View all favorites ({favorites.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: t("UserDashboard.FacilitySearch"),
                        desc: t("UserDashboard.FindNearestHospitals"),
                        icon: MapPin,
                        color: "from-emerald-500/10 to-teal-500/10",
                        textColor: "text-emerald-600 dark:text-emerald-400",
                        path: "/user/dashboard/search"
                    },
                    {
                        title: t("UserDashboard.RealTimeChat"),
                        desc: t("UserDashboard.TalkWithPharmacy"),
                        icon: MessageSquare,
                        color: "from-teal-500/10 to-cyan-500/10",
                        textColor: "text-teal-600 dark:text-teal-400",
                        path: "/user/dashboard/messages"
                    },
                    {
                        title: t("UserDashboard.ProfileAndSecurity"),
                        desc: t("UserDashboard.UpdateYourInfo"),
                        icon: User,
                        color: "from-emerald-500/10 to-cyan-500/10",
                        textColor: "text-emerald-600 dark:text-teal-400",
                        path: "/user/dashboard/profile"
                    }
                ].map((act, index) => {
                    const Icon = act.icon;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => navigate(act.path)}
                            className="group bg-white dark:bg-gray-950/40 border border-slate-100 dark:border-gray-800/80 rounded-2xl p-6 text-left hover:bg-white dark:hover:bg-gray-900/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-48 relative overflow-hidden"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${act.color} ${act.textColor} flex items-center justify-center shadow-inner`}>
                                <Icon size={24} />
                            </div>
                            <div className="space-y-1 z-10">
                                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                    {act.title}
                                    <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400">{act.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

