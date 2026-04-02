import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiGetStockHistory } from "../../../api/inventory";
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
        return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-semibold uppercase">{t("inventory.history.type.sale")}</span>;
      case "RESTOCK":
        return <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-semibold uppercase">{t("inventory.history.type.restock")}</span>;
      case "ADJUSTMENT":
        return <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-xs font-semibold uppercase">{t("inventory.history.type.adjustment")}</span>;
      default:
        return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold uppercase">{t("inventory.history.type.manual")}</span>;
    }
  };

  if (loading && page === 1) {
    return (
      <>
        <Loading/>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
            <History className="w-6 h-6 text-primary " />
            {t("inventory.history.title")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("inventory.history.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-100 group-hover:text-primary transition-colors" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
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
            className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-green-700">
        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No stock movements found</h3>
            <p className="text-gray-500 max-w-xs mt-2">
              Every time stock levels change, a log entry will be created here for auditing purposes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("inventory.history.column.date")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("inventory.history.column.drug")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("inventory.history.column.change")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    {t("Common.Status")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("inventory.history.column.performedBy")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("inventory.history.column.reason")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {historyItems.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {log.inventory?.drug?.brand_name_en}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 font-bold ${log.change_amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {log.change_amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(log.change_amount)} {t("inventory.toast.units")}
                          <span className="text-xs text-gray-400 font-normal ml-1">
                            ({log.old_stock} → {log.new_stock})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(log.type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <User className="w-3 h-3 text-gray-500" />
                          </div>
                          {log.performer?.name || t("Common.NoData")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 italic max-w-xs truncate" title={log.reason}>
                          {log.reason || "No note provided"}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {lastPage}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                {t("Common.Back")}
              </button>
              <button
                disabled={page === lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
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
