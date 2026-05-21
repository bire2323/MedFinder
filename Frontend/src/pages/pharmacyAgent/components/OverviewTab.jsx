import React from "react";
import { motion } from "framer-motion";
import { Pill, Package, AlertCircle, Activity, Calendar, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOutletContext, useNavigate } from "react-router-dom";

export const StatCard = ({ title, value, trend, icon, color, index }) => {
    const colorVariants = {
        emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100/55 dark:border-emerald-900/30",
        blue: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100/55 dark:border-blue-900/30",
        purple: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100/55 dark:border-purple-900/30",
        orange: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100/55 dark:border-orange-900/30",
        red: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100/55 dark:border-red-900/30",
    };

    // Stagger animation delay based on index
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/2 transition-all duration-300 relative overflow-hidden group cursor-default"
        >
            {/* Soft background glow */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-emerald-500/5 dark:bg-emerald-500/2 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white leading-none">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl border ${colorVariants[color]} transition-transform duration-500 group-hover:scale-110`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-1">
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                        color === 'red' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' :
                        color === 'orange' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' :
                        'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    }`}>
                        {color === 'red' ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        {trend}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default function OverviewTab() {
    const { inventory, analytics } = useOutletContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Custom CSS category badge colors helper
    const getCategoryStyles = (category) => {
        const cat = String(category).toLowerCase();
        if (cat.includes("antibiotic")) return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30";
        if (cat.includes("pain") || cat.includes("relief")) return "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-900/30";
        if (cat.includes("cardio") || cat.includes("heart")) return "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30";
        if (cat.includes("vitamin") || cat.includes("supplement")) return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30";
        return "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30";
    };

    // Stagger animation container
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8"
        >
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                    title={t("PharmacyDashboard.TotalDrugs")}
                    value={analytics?.total_items?.toString() || "0"}
                    trend="+12 this week"
                    icon={<Pill />}
                    color="emerald"
                    index={0}
                />
                <StatCard
                    title={t("PharmacyDashboard.LowStock")}
                    value={analytics?.low_stock?.toString() || "0"}
                    trend="Needs attention"
                    icon={<Package />}
                    color="orange"
                    index={1}
                />
                <StatCard
                    title={t("PharmacyDashboard.OutOfStock")}
                    value={analytics?.out_of_stock?.toString() || "0"}
                    trend="Critical status"
                    icon={<AlertCircle />}
                    color="red"
                    index={2}
                />
                <StatCard
                    title={t("PharmacyDashboard.USERSESSIONS")}
                    value={analytics?.user_sessions?.toString() || "0"}
                    trend="Active sessions"
                    icon={<Activity />}
                    color="purple"
                    index={3}
                />
            </div>

            {/* Inventory Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm shadow-slate-100/50 dark:shadow-none">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">
                            {t("PharmacyDashboard.InventoryOverview")}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                            Quick status review of your latest registered drugs
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/pharmacy/dashboard/inventory")}
                        className="group inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all duration-300"
                    >
                        <span>{t("PharmacyDashboard.ViewAll")}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Desktop View Table: Shown on medium/large screens */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <th className="pb-4 pl-4">{t("inventory.table.drugName")}</th>
                                <th className="pb-4">{t("inventory.table.category")}</th>
                                <th className="pb-4">{t("inventory.table.stock")}</th>
                                <th className="pb-4">{t("inventory.table.price")}</th>
                                <th className="pb-4 pr-4">{t("inventory.table.availability")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {inventory?.slice(0, 5).map((drug) => {
                                const inv = drug.pivot || drug.inventory || {};
                                const isLow = inv.stock <= (inv.low_stock_threshold || 10);
                                const isOut = inv.stock === 0;
                                return (
                                    <tr key={drug.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors group">
                                        <td className="py-3.5 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-800 dark:to-slate-800/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100/20 dark:border-slate-700/30 transition-transform group-hover:scale-105">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                                        {drug.brand_name_en}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic mt-0.5">
                                                        {drug.generic_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex flex-col">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black w-fit uppercase tracking-wider ${getCategoryStyles(inv.category)}`}>
                                                    {inv.category || "—"}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold mt-1 pl-1">
                                                    {inv.dosage_form}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex flex-col">
                                                <span className={`font-black tracking-wide text-sm ${isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-emerald-500"}`}>
                                                    {inv.stock} {t("inventory.toast.units")}
                                                </span>
                                                {isLow && !isOut && (
                                                    <span className="text-[10px] text-amber-500 font-black flex items-center gap-0.5 mt-0.5">
                                                        <TrendingDown size={10} />
                                                        {t("inventory.filters.lowStock")}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 dark:text-slate-200">
                                                    {inv.price} {t("Common.Currency")}
                                                </span>
                                                {inv.cost_price && (
                                                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                        {t("inventory.table.costPrice")}: {inv.cost_price}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                                                {inv.expire_date || "—"}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Card Grid: Fully responsive fallback on small screens */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="block md:hidden space-y-4"
                >
                    {inventory?.slice(0, 5).map((drug) => {
                        const inv = drug.pivot || drug.inventory || {};
                        const isLow = inv.stock <= (inv.low_stock_threshold || 10);
                        const isOut = inv.stock === 0;

                        return (
                            <motion.div
                                key={drug.id}
                                variants={itemVariants}
                                className="p-4 bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-4 shadow-sm"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-slate-200/50 dark:border-slate-700/30">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 dark:text-white leading-tight">
                                                {drug.brand_name_en}
                                            </p>
                                            <p className="text-xs text-slate-400 font-semibold italic mt-0.5">
                                                {drug.generic_name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getCategoryStyles(inv.category)}`}>
                                        {inv.category || "—"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{t("inventory.table.stock")}</span>
                                        <span className={`font-black text-xs mt-1 ${isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-emerald-500"}`}>
                                            {inv.stock} u
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-800/40">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{t("inventory.table.price")}</span>
                                        <span className="font-black text-xs text-slate-700 dark:text-slate-200 mt-1">
                                            {inv.price} {t("Common.Currency")}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Expires</span>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full">
                                            {inv.expire_date || "—"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </motion.div>
    );
}
