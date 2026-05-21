import React from "react";
import { useTranslation } from "react-i18next";
import { Heart, Search, MapPin, Navigation, MessageSquare } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function UserFavorites() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { favorites, toggleFavorite, openFacilityInMapAndRoute, requestChatWithFacility } = useOutletContext();

    return (
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="bg-white dark:bg-gray-950/40 border border-slate-100 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Heart size={18} className="text-rose-500 fill-current" />
                            {t("UserDashboard.SavedPlaces")}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            {t("UserDashboard.YourBookmarked")}
                        </p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl py-12 px-4 text-center bg-slate-50/50 dark:bg-gray-900/10 flex flex-col items-center justify-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-inner">
                            <Heart size={26} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("UserDashboard.NoFavoritesYet")}</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                                {t("UserDashboard.BookmarkAFacility")}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/user/dashboard/search")}
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/10 transition-all hover:scale-102"
                        >
                            <Search size={14} />
                            {t("UserDashboard.OpenInSearch")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {favorites.map((f) => (
                            <div
                                key={`${f.type}:${String(f.id)}`}
                                className="group bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-gray-800/80 rounded-2xl p-5 hover:bg-white dark:hover:bg-gray-900/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{f.name}</p>
                                            
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${f.type === "hospital"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                                                        : "bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400"
                                                        }`}
                                                >
                                                    {f.type === "hospital" ? t("Map.hospital") : t("Map.pharmacy")}
                                                </span>
                                            </div>

                                            {f.address && (
                                                <p className="text-xs text-slate-500 dark:text-gray-400 truncate flex items-center gap-1 mt-1.5">
                                                    <MapPin size={12} className="shrink-0 text-slate-400" />
                                                    <span>{f.address}</span>
                                                </p>
                                            )}
                                        </div>
                                        
                                        <button
                                            type="button"
                                            onClick={() => toggleFavorite(f)}
                                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:scale-105 transition-all duration-200 shadow-sm shrink-0"
                                            aria-label={t("UserDashboard.Remove")}
                                            title={t("UserDashboard.Remove")}
                                        >
                                            <Heart size={16} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => openFacilityInMapAndRoute(f)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10 hover:scale-102"
                                    >
                                        <Navigation size={13} className="shrink-0" />
                                        <span>{t("UserDashboard.OpenInSearch")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => requestChatWithFacility(f)}
                                        className="flex-1 rounded-xl bg-slate-50 dark:bg-gray-800/80 text-slate-700 dark:text-slate-200 py-2.5 px-2 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-100 dark:border-gray-850 hover:scale-102"
                                        title={f.type === "hospital" ? "Message hospital agent" : "Message pharmacy agent"}
                                    >
                                        <MessageSquare size={13} className="text-slate-400 dark:text-gray-400 shrink-0" />
                                        <span>{t("UserDashboard.Messages")}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

