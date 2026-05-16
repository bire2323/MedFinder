import React from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function UserFavorites() {
    const { t } = useTranslation();
    const { favorites, toggleFavorite, openFacilityInMapAndRoute } = useOutletContext();

    return (
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-sm md:text-xl sm:text-2xl font-bold">{t("UserDashboard.SavedPlaces")}</h2>
                    <p className="text-[10px] md:text-sm text-slate-600 dark:text-gray-300">{t("UserDashboard.YourBookmarked")}</p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-8 text-center bg-slate-50 dark:bg-gray-900/40">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{t("UserDashboard.NoFavoritesYet")}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("UserDashboard.BookmarkAFacility")}</p>
                    <button
                        type="button"
                        onClick={() => window.location.hash = "/user/dashboard/search"}
                        className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700"
                    >
                        {t("UserDashboard.OpenInSearch")}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((f) => (
                        <div key={`${f.type}:${String(f.id)}`} className="bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-4">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold truncate">{f.name}</p>
                                    <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</p>
                                    {f.address && <p className="text-xs text-slate-600 dark:text-gray-300 mt-2 truncate">{f.address}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleFavorite(f)}
                                    className="p-2 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300 hover:bg-blue-600/15 transition-colors"
                                    aria-label={t("UserDashboard.Remove")}
                                    title={t("UserDashboard.Remove")}
                                >
                                    <Heart size={16} className="fill-current" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => openFacilityInMapAndRoute(f)}
                                className="mt-4 w-full rounded-xl bg-blue-600 text-white py-2.5 font-bold hover:bg-blue-700 transition-colors"
                            >
                                Open in Search
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
