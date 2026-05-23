import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiGetStockHistory } from "../../../api/inventory";
import {
  getPerformerName,
  getHistoryDrugName,
  getHistoryBatchNumber,
  getHistoryQuantities,
} from "../../../utils/inventoryHelpers";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  User,
  Calendar,
  Filter,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Loading from "../../../component/SupportiveComponent/Loading";

const InventoryHistory = () => {
  const { t } = useTranslation();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiGetStockHistory({
        page,
        type: typeFilter !== "all" ? typeFilter : undefined
      });
      if (res.success) {
        setHistoryItems(res.data);
        setLastPage(res.meta.last_page);
      }
    } catch (error) {
      toast.error(t("inventory.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, typeFilter]);

  const getStatusBadge = (type) => {
    switch (type) {
      case "SALE":
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-100/50 select-none uppercase tracking-wider">{t("inventory.history.type.sale")}</span>;
      case "RESTOCK":
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-100/50 select-none uppercase tracking-wider">{t("inventory.history.type.restock")}</span>;
      case "ADJUSTMENT":
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-100/50 select-none uppercase tracking-wider">{t("inventory.history.type.adjustment")}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 dark:bg-blue-950/40 border border-blue-100/50 select-none uppercase tracking-wider">{t("inventory.history.type.manual")}</span>;
    }
  };

  if (loading && page === 1) {
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
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
            <History className="w-5 h-5 text-emerald-500" />
            {t("inventory.history.title")}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
            {t("inventory.history.description")}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer dark:text-gray-200"
            >
              <option value="all">{t("inventory.filters.allStatus")}</option>
              <option value="MANUAL">{t("inventory.history.type.manual")}</option>
              <option value="SALE">{t("inventory.history.type.sale")}</option>
              <option value="RESTOCK">{t("inventory.history.type.restock")}</option>
              <option value="ADJUSTMENT">{t("inventory.history.type.adjustment")}</option>
            </select>
          </div>

          <button
            onClick={fetchHistory}
            className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Log Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none overflow-hidden">
        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-850/50 rounded-full flex items-center justify-center mb-4 text-slate-350">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No stock movements found</h3>
            <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs mt-2 max-w-xs leading-relaxed">
              Every time stock levels change, a log entry will be created here for auditing purposes.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="px-6 py-4">{t("inventory.history.column.date")}</th>
                    <th className="px-6 py-4">{t("inventory.history.column.drug")}</th>
                    <th className="px-6 py-4">Batch</th>
                    <th className="px-6 py-4">{t("inventory.history.column.change")}</th>
                    <th className="px-6 py-4 text-center">{t("Common.Status")}</th>
                    <th className="px-6 py-4">{t("inventory.history.column.performedBy")}</th>
                    <th className="px-6 py-4">{t("inventory.history.column.reason")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  <AnimatePresence mode="popLayout">
                    {historyItems.map((log, index) => {
                      const { oldQ, newQ } = getHistoryQuantities(log);
                      const batchNum = getHistoryBatchNumber(log);
                      return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: index * 0.02 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors group"
                      >
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs text-slate-550 dark:text-slate-400 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-850 dark:text-white">
                          {getHistoryDrugName(log)}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                          {batchNum || "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className={`flex items-center gap-1 font-black ${log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.change_amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {Math.abs(log.change_amount)} {t("inventory.toast.units")}
                            <span className="text-[10px] text-slate-400 font-semibold ml-1">
                              ({oldQ} → {newQ})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {getStatusBadge(log.type)}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-350">
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center border border-slate-200/50 dark:border-slate-800">
                              <User className="w-3 h-3 text-slate-500" />
                            </div>
                            <span className="font-bold">{getPerformerName(log)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic max-w-xs truncate" title={log.reason}>
                            {log.reason || "—"}
                          </p>
                        </td>
                      </motion.tr>
                    );})}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Grid View */}
            <div className="block md:hidden p-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {historyItems.map((log, index) => {
                  const { oldQ, newQ } = getHistoryQuantities(log);
                  return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.02 }}
                    className="p-4 bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100/80 dark:border-slate-800/85 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-slate-800 dark:text-white leading-tight">
                          {getHistoryDrugName(log)}
                        </p>
                        {getHistoryBatchNumber(log) && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            Batch: {getHistoryBatchNumber(log)}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-450" />
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(log.type)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/55">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase">Change Amount</span>
                        <div className={`flex items-center gap-0.5 font-black text-xs mt-0.5 ${log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.change_amount > 0 ? "+" : "-"}
                          {Math.abs(log.change_amount)} units
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase">Performed By</span>
                        <p className="text-xs font-bold text-slate-650 dark:text-slate-350 mt-0.5 truncate">
                          {getPerformerName(log)}
                        </p>
                      </div>
                    </div>

                    {log.reason && (
                      <div className="pt-2 border-t border-slate-100/50 dark:border-slate-800/40">
                        <span className="text-[9px] text-slate-400 font-black uppercase">Reason / Note</span>
                        <p className="text-xs font-semibold italic text-slate-450 dark:text-slate-500 mt-0.5 leading-relaxed">
                          {log.reason}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );})}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Pagination Panel */}
        {lastPage > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Page {page} of {lastPage}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-650 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {t("Common.Back")}
              </button>
              <button
                disabled={page === lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                {t("common.next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;
