import React from "react";
import { useTranslation } from "react-i18next";
import { History, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function UserOverview() {
    const { t } = useTranslation();
    const { recents, favorites, openFacilityInMapAndRoute } = useOutletContext();

    return (
        <div className="max-w-full sm:max-w-7xl mx-auto px-1 sm:px-2 md:px-6 lg:px-8 py-3 md:py-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-5">
                    <h2 className="text-[10px] md:text-base font-bold mb-1">{t("UserDashboard.RecentViews")}</h2>
                    <p className="text-[9px] md:text-sm text-slate-600 dark:text-gray-300 mb-4">
                        {t("UserDashboard.TapAnyFacility")}
                    </p>

                    {recents.length === 0 ? (
                        <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-6 text-center bg-slate-50 dark:bg-gray-900/40">
                            <p className="font-bold text-slate-800 dark:text-slate-100">{t("UserDashboard.NoRecentsYet")}</p>
                            <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                                {t("UserDashboard.YourLastViewed")}
                            </p>
                            <button
                                type="button"
                                onClick={() => window.location.hash = "/user/dashboard/search"}
                                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700"
                            >
                                <History size={16} />
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
                                    className="text-left border border-slate-200 dark:border-gray-700 rounded-2xl p-4 hover:bg-slate-50 shadow-sm dark:hover:bg-gray-800/60 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-bold truncate">{f.name}</p>
                                            <p className="text-xs text-slate-600 dark:text-gray-300 truncate">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</p>
                                            {f.address && (
                                                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate">{f.address}</p>
                                            )}
                                        </div>
                                        <span
                                            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${f.type === "hospital"
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
                    <h2 className="text-base font-bold mb-1">{t("UserDashboard.SavedPlaces")}</h2>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">{t("UserDashboard.QuicklyJumpBack")}</p>

                    {favorites.length === 0 ? (
                        <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-6 text-center bg-slate-50 dark:bg-gray-900/40">
                            <p className="font-bold text-slate-800 dark:text-slate-100">{t("UserDashboard.NoFavoritesYet")}</p>
                            <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("UserDashboard.BookmarkPharmacies")}</p>
                            <button
                                type="button"
                                onClick={() => window.location.hash = "/user/dashboard/search"}
                                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700"
                            >
                                <Search size={16} />
                                {t("UserDashboard.FindFacilities")}
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
                                    <p className="font-bold">{f.name}</p>
                                    <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</p>
                                </button>
                            ))}
                            {favorites.length > 4 && (
                                <button
                                    type="button"
                                    onClick={() => window.location.hash = "/user/dashboard/favorites"}
                                    className="mt-2 w-full text-center text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline"
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
                    onClick={() => window.location.hash = "/user/dashboard/search"}
                    className="bg-white dark:bg-gray-800/40 shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                    <p className="font-bold">{t("UserDashboard.FacilitySearch")}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("UserDashboard.FindNearestHospitals")}</p>
                </button>
                <button
                    type="button"
                    onClick={() => window.location.hash = "/user/dashboard/messages"}
                    className="bg-white dark:bg-gray-800/40 shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                    <p className="font-bold">{t("UserDashboard.RealTimeChat")}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("UserDashboard.TalkWithPharmacy")}</p>
                </button>
                <button
                    type="button"
                    onClick={() => window.location.hash = "/user/dashboard/profile"}
                    className="bg-white dark:bg-gray-800/40 shadow-xl border border-slate-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                    <p className="font-bold">{t("UserDashboard.ProfileAndSecurity")}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("UserDashboard.UpdateYourInfo")}</p>
                </button>
            </div>
        </div>
    );
}
