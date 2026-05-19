import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiGetTrash, apiRestoreDrug } from "../../../api/inventory";
import { Trash2, RotateCcw, Package, AlertCircle, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const InventoryTrash = () => {
  const { t } = useTranslation();
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await apiGetTrash();
      if (res.success) {
        setTrashedItems(res.data);
      }
    } catch (error) {
      toast.error(t("inventory.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id, name) => {
    try {
      setRestoringId(id);
      const res = await apiRestoreDrug(id);
      if (res.success) {
        toast.success(t("inventory.toast.drugRestored"));
        setTrashedItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      toast.error(t("inventory.error.failedUpdate"));
    } finally {
      setRestoringId(null);
    }
  };

  const getCategoryBadgeStyles = (category) => {
    const cat = String(category).toLowerCase();
    if (cat.includes("antibiotic")) return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30";
    if (cat.includes("pain") || cat.includes("relief")) return "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-900/30";
    if (cat.includes("cardio") || cat.includes("heart")) return "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30";
    if (cat.includes("vitamin") || cat.includes("supplement")) return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30";
    return "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30";
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
        <p className="text-xs text-slate-400 font-bold tracking-wide animate-pulse">{t("Common.Loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div>
        <h2 className="text-xl font-black text-slate-850 dark:text-white flex items-center gap-2 tracking-tight">
          <Trash2 className="w-5 h-5 text-emerald-500" />
          {t("inventory.trash.title")}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
          {t("inventory.trash.description")}
        </p>
      </div>

      {/* Main card container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none overflow-hidden">
        {trashedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-850/50 rounded-full flex items-center justify-center mb-4 text-slate-350">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{t("inventory.trash.empty")}</h3>
            <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs mt-2 max-w-xs leading-relaxed">
              Medicines you delete from the inventory will appear here for 30 days before being permanently removed.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-850/10 border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="px-6 py-4">{t("inventory.table.drugName")}</th>
                    <th className="px-6 py-4">{t("inventory.table.category")}</th>
                    <th className="px-6 py-4">{t("inventory.table.stock")}</th>
                    <th className="px-6 py-4">Deleted At</th>
                    <th className="px-6 py-4 text-right">{t("inventory.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  <AnimatePresence mode="popLayout">
                    {trashedItems.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 100, delay: index * 0.02 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors group"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-450 border border-slate-200/50 dark:border-slate-800 group-hover:scale-105 transition-transform duration-300">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-850 dark:text-white leading-tight">
                                {item.drug?.brand_name_en || "Deleted Drug"}
                              </div>
                              <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic mt-0.5">
                                {item.drug?.generic_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black w-fit uppercase tracking-wider ${getCategoryBadgeStyles(item.category)}`}>
                            {item.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-black text-sm text-slate-700 dark:text-slate-200">
                          {item.stock} {t("inventory.toast.units")}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2 text-xs text-slate-550 dark:text-slate-400 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(item.deleted_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right pr-6">
                          <button
                            onClick={() => handleRestore(item.id, item.drug?.brand_name_en)}
                            disabled={restoringId === item.id}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-600 rounded-xl transition-all duration-350 active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            {restoringId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            {t("inventory.trash.restore")}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Grid View */}
            <div className="block md:hidden p-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {trashedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.02 }}
                    className="p-4 bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100/80 dark:border-slate-800/85 space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200/50 dark:border-slate-700/30">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white leading-tight">
                            {item.drug?.brand_name_en || "Deleted Drug"}
                          </p>
                          <p className="text-xs text-slate-400 font-semibold italic mt-0.5">
                            {item.drug?.generic_name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getCategoryBadgeStyles(item.category)}`}>
                        {item.category || "General"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/55">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase">Stock Level</span>
                        <p className="font-black text-xs mt-0.5 text-slate-700 dark:text-slate-200">
                          {item.stock} units
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase">Deleted On</span>
                        <p className="text-xs font-bold text-slate-650 dark:text-slate-350 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.deleted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-150/40 dark:border-slate-800/40">
                      <button
                        onClick={() => handleRestore(item.id, item.drug?.brand_name_en)}
                        disabled={restoringId === item.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-600 rounded-xl transition-all duration-350 active:scale-95 disabled:opacity-50 cursor-pointer border border-emerald-500/10"
                      >
                        {restoringId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        {t("inventory.trash.restore")}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryTrash;
