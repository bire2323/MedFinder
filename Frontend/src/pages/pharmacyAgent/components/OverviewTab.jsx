import React from "react";
import { motion } from "framer-motion";
import { Pill, Package, AlertCircle, Activity, MessageSquare, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export const StatCard = ({ title, value, trend, icon, color }) => {
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

import { useOutletContext, useNavigate } from "react-router-dom";

export default function OverviewTab() {
    const { inventory, analytics, recentChats } = useOutletContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    // console.log(analytics);
    // console.log(inventory);
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                    title={t("PharmacyDashboard.TotalDrugs")}
                    value={analytics?.total_items?.toString() || "0"}
                    trend="+12 this week"
                    icon={<Pill />}
                    color="emerald"
                />

                <StatCard
                    title={t("PharmacyDashboard.LowStock")}
                    value={analytics?.low_stock?.toString() || "0"}
                    trend="Needs attention"
                    icon={<Package />}
                    color="orange"
                />
                <StatCard
                    title={t("PharmacyDashboard.OutOfStock")}
                    value={analytics?.out_of_stock?.toString() || "0"}
                    trend="Critical"
                    icon={<AlertCircle />}
                    color="red"
                />
                <StatCard
                    title={t("PharmacyDashboard.USERSESSIONS")}
                    value={analytics?.user_sessions?.toString() || "0"}
                    trend=""
                    icon={<Activity />}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">{t("PharmacyDashboard.InventoryOverview")}</h3>
                        <button
                            onClick={() => navigate("/pharmacy/dashboard/inventory")}
                            className="text-sm text-blue-500 hover:underline"
                        >
                            {t("PharmacyDashboard.ViewAll")}
                        </button>
                    </div>
                    <div className="space-y-3">
                        {inventory.map((drug) => {
                            const inv = drug.pivot || drug.inventory || {};
                            const isLow = inv.stock <= (inv.low_stock_threshold || 10);
                            const isOut = inv.stock === 0;
                            return (
                                <div key={drug.id} className="flex flex-nowrap hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="px-6 py-4">
                                        <div className="inline-flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                                    {drug.brand_name_en}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate max-w-[150px]">
                                                    {drug.generic_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 text-sm">
                                        <span className="text-slate-600 dark:text-gray-400 font-medium">{inv.category || "—"}</span>
                                        <p className="text-[10px] text-slate-400">{inv.dosage_form}</p>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="inline-flex flex-col">
                                            <span className={`font-bold ${isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-emerald-500"}`}>
                                                {inv.stock} {t("inventory.toast.units")}
                                            </span>
                                            {isLow && !isOut && (
                                                <div className="inline-flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                                                    <TrendingDown size={10} />
                                                    {t("inventory.filters.lowStock")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="inline-flex flex-col text-sm">
                                            <span className="font-bold text-slate-700 dark:text-gray-200">
                                                {inv.price} {t("Common.Currency")}
                                            </span>
                                            {inv.cost_price && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {t("inventory.table.costPrice")}: {inv.cost_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Calendar size={14} className="text-slate-400" />
                                            {inv.expire_date || "—"}
                                        </div>
                                    </div>
                                    {/* <div className="px-6 py-4">
                                        <StatusBadge inv={inv} t={t} />
                                    </div> */}
                                    {/* <div className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleToggleAvailability(drug)}
                                                className={`p-2 rounded-lg transition-colors ${inv.is_available ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                                                title={inv.is_available ? "Disable" : "Enable"}
                                            >
                                                {inv.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(drug)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedDrug(drug);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div> */}
                                </div>
                            );
                        })
                        }
                        {/* {inventory?.slice(0, 5).map((drug) => (
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
                                    {drug.stock} {t("PharmacyDashboard.Units")}
                                </span>
                            </div>
                        ))} */}
                    </div>
                </div>

                {/* <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 p-4 sm:p-6 shadow-sm">
                    <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" />
                        {t("PharmacyDashboard.RecentChats")}
                    </h3>
                    <div className="space-y-4">
                        {recentChats?.map((chat) => (
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
                </div> */}
            </div>
        </motion.div>
    );
}
