import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Calendar,
  Filter,
  Users,
  ShoppingBag,
  Tag,
  Boxes,
  Shield,
  ShieldAlert,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { AllAuditLog, ClearOldAuditLogs } from "../../api/admin";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "ALL", labelKey: "Admin.AuditLogCategories.ALL", icon: null },
  { id: "auth", labelKey: "Admin.AuditLogCategories.auth", icon: Shield, color: "text-blue-600 bg-blue-50/60 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400" },
  { id: "user", labelKey: "Admin.AuditLogCategories.user", icon: Users, color: "text-sky-650 bg-sky-50/60 border border-sky-100 dark:bg-sky-950/30 dark:border-sky-900/40 dark:text-sky-400" },
  { id: "hospital", labelKey: "Admin.AuditLogCategories.hospital", icon: Boxes, color: "text-purple-650 bg-purple-50/60 border border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/40 dark:text-purple-450" },
  { id: "pharmacy", labelKey: "Admin.AuditLogCategories.pharmacy", icon: ShoppingBag, color: "text-emerald-650 bg-emerald-50/60 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-450" },
  { id: "inventory", labelKey: "Admin.AuditLogCategories.inventory", icon: Tag, color: "text-orange-655 bg-orange-50/60 border border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/40 dark:text-orange-405" },
  { id: "department", labelKey: "Admin.AuditLogCategories.department", icon: Users, color: "text-indigo-650 bg-indigo-50/60 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-405" },
  { id: "security", labelKey: "Admin.AuditLogCategories.security", icon: ShieldAlert, color: "text-red-600 bg-red-50/60 border border-red-105 dark:bg-red-955/30 dark:border-red-900/40 dark:text-red-405" },
  { id: "system", labelKey: "Admin.AuditLogCategories.system", icon: Activity, color: "text-slate-600 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" },
];

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
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } }
};

const AuditLog = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [auditLog, setAuditLog] = useState([]);

  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [openedId, setOpenedId] = useState(0);

  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [clearLogsDropdownOpen, setClearLogsDropdownOpen] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setClearLogsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClearOldLogs = async (period) => {
    setClearLogsDropdownOpen(false);

    const periodLabel = period === "1_month"
      ? t("Admin.OlderThan1Month")
      : period === "6_months"
      ? t("Admin.OlderThan6Months")
      : t("Admin.OlderThan1Year");

    const confirmationText = t("Admin.ConfirmClearLogsDesc", { period: periodLabel }) ||
      `Are you sure you want to delete audit logs ${periodLabel.toLowerCase()}?`;

    if (!window.confirm(confirmationText)) {
      return;
    }

    setIsClearingLogs(true);
    const loadingToast = toast.loading(t("Admin.ClearingLogs") || "Clearing old logs...");

    try {
      const res = await ClearOldAuditLogs(period);

      if (res?.success) {
        toast.success(
          t("Admin.ClearLogsSuccess", { count: res.deleted_count }) ||
          `Successfully cleared ${res.deleted_count} old audit logs.`,
          { id: loadingToast }
        );
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error(res?.message || "Failed to clear logs");
      }
    } catch (error) {
      console.error("Failed to clear old audit logs:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(
        t("Admin.ClearLogsFailed", { error: errorMsg }) ||
        `Failed to clear old logs: ${errorMsg}`,
        { id: loadingToast }
      );
    } finally {
      setIsClearingLogs(false);
    }
  };

  const toggleMetadata = (logId) => {
    setExpandedRowId(expandedRowId === logId ? null : logId);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeCategory, startDate, endDate]);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const res = await AllAuditLog(
          page,
          searchTerm,
          activeCategory,
          startDate || undefined,
          endDate || undefined
        );

        const logs = Array.isArray(res?.data) ? res.data : [];
        const dataWithParsedMetadata = logs.map((log) => {
          let metadata = {};

          if (typeof log.metadata === 'string') {
            try {
              metadata = JSON.parse(log.metadata || "{}");
            } catch (e) {
              console.warn(`Failed to parse metadata for log ${log.id}:`, e);
            }
          } else {
            metadata = log.metadata || {};
          }

          return {
            ...log,
            metadata,
            productName: metadata.p_name,
            userName: metadata.u_name,
            priceChange: metadata["new price"]
              ? `${metadata["old Price"]} → ${metadata["new price"]}`
              : null,
          };
        });

        setAuditLog(dataWithParsedMetadata);
        setPagination(res?.pagination || {});
      } catch (error) {
        console.error('Failed to load audit logs:', error);
        setAuditLog([]);
        setPagination({});
      }
    };

    loadAuditLogs();
  }, [page, searchTerm, activeCategory, startDate, endDate, refreshTrigger]);

  const handleDownload = () => {
    const url = `/api/audit-logs/export?search=${searchTerm}&category=${activeCategory}&start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  const renderStatus = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400">
            <CheckCircle size={10} /> {t("Admin.StatusSuccess")}
          </span>
        );
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 border border-red-200 text-red-700 dark:bg-red-955/20 dark:border-red-900/40 dark:text-red-400">
            <XCircle size={10} /> {t("Admin.StatusCritical")}
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400">
            <AlertTriangle size={10} /> {t("Admin.StatusWarning")}
          </span>
        );
      default:
        return <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">{status}</span>;
    }
  };

  const getCategoryConfig = (catString) => {
    return CATEGORIES.find((c) => c.id === catString) || CATEGORIES[8];
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white uppercase tracking-wider">{t("Admin.AuditLog")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("Admin.AuditLogDesc")}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              className="outline-0 bg-transparent text-slate-700 dark:text-slate-300 border-none p-0 cursor-pointer"
              name="startDate"
              id="Start Date"
              onChange={(e) => setStartDate(e.target.value)}
              value={startDate}
            />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">{t("Admin.DateTo")}</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              className="outline-0 bg-transparent text-slate-700 dark:text-slate-300 border-none p-0 cursor-pointer"
              name="endDate"
              id="End Date"
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
            />
          </div>

          {/* Clear Logs Dropdown */}
          <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
              onClick={() => setClearLogsDropdownOpen(!clearLogsDropdownOpen)}
              disabled={isClearingLogs}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md focus:outline-none disabled:opacity-50 cursor-pointer border-transparent"
            >
              {isClearingLogs ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Trash2 size={14} />
              )}
              <span>{t("Admin.ClearLogs") || "Clear Logs"}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${clearLogsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {clearLogsDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl z-50 overflow-hidden"
                >
                  <div className="py-1.5">
                    <button
                      onClick={() => handleClearOldLogs("1_month")}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors cursor-pointer"
                    >
                      {t("Admin.OlderThan1Month")}
                    </button>
                    <button
                      onClick={() => handleClearOldLogs("6_months")}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors cursor-pointer"
                    >
                      {t("Admin.OlderThan6Months")}
                    </button>
                    <button
                      onClick={() => handleClearOldLogs("1_year")}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors cursor-pointer"
                    >
                      {t("Admin.OlderThan1Year")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
        <div className="flex space-x-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer ${isActive
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 border-transparent text-white shadow-md shadow-emerald-500/10"
                  : "bg-white border-slate-200 text-slate-550 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
              >
                {Icon && (
                  <Icon
                    size={14}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                )}
                {t(cat.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder={t("Admin.SearchEventsPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-805 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-450"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer">
            <Filter size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-950/20 text-slate-500 dark:text-slate-450 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">{t("Admin.EventType")}</th>
                <th className="px-6 py-4">{t("Admin.Description")}</th>
                <th className="px-6 py-4">{t("Admin.UserIdIp")}</th>
                <th className="px-6 py-4">{t("Admin.DateTime")}</th>
                <th className="px-6 py-4">{t("Admin.Status")}</th>
                <th className="px-6 py-4 text-right">{t("Admin.Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {auditLog.length > 0 ? (
                auditLog.map((log) => {
                  const config = getCategoryConfig(log.category);
                  const CatIcon = config.icon;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors group">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${config.color}`}>
                              <CatIcon size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                                {log.event}
                              </p>
                              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 mt-1">
                                {t(config.labelKey)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 max-w-sm break-words">
                            {log.detail}
                          </p>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 dark:text-white">
                              {log.user_id}
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono mt-0.5">
                              {log.ip_address}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-xs font-bold text-slate-650 dark:text-slate-350 whitespace-nowrap">
                            {dayjs(log.created_at).format("YYYY-MM-DD")}{" "}
                            <span className="text-slate-300 dark:text-slate-700">/</span>{" "}
                            {dayjs(log.created_at).format("HH:mm:ss")}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          {renderStatus(log.event_status)}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            onClick={() => {
                              toggleMetadata(log.id);
                              setOpenedId(openedId === log.id ? 0 : log.id);
                            }}
                          >
                            {openedId === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                      </tr>

                      <AnimatePresence>
                        {expandedRowId === log.id && (
                          <tr>
                            <td colSpan="6" className="px-6 py-3 bg-slate-50/40 dark:bg-slate-950/20">
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm overflow-hidden"
                              >
                                <div className="flex items-center justify-between mb-3.5">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-805 dark:text-white">
                                    {t("Admin.Details")}
                                  </h4>
                                  <button
                                    onClick={() => setExpandedRowId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                {Object.keys(log.metadata).length > 0 ? (
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {Object.entries(log.metadata).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex items-start border-b border-slate-50 dark:border-slate-800/40 pb-2 last:border-0"
                                        >
                                          <div className="w-1/4 text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                                            {key}:
                                          </div>
                                          <div className="w-3/4 text-xs font-bold text-slate-750 dark:text-slate-300">
                                            {typeof value === "object" ? (
                                              <pre className="text-[10px] font-mono bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-350 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 max-w-full overflow-x-auto">
                                                {JSON.stringify(value, null, 2)}
                                              </pre>
                                            ) : (
                                              <span className="break-all font-semibold">
                                                {String(value)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider text-center py-4">
                                    {t("Admin.NoMetadataAvailable")}
                                  </p>
                                )}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search size={36} className="mb-2.5 opacity-25" />
                      <p className="text-xs font-black uppercase tracking-widest">{t("Admin.NoAuditLogsFound")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
            {t("Admin.ShowingEvents", { count: auditLog.length })}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              disabled={!pagination.prev_page_url}
              onClick={() => setPage(page - 1)}
            >
              {t("Admin.Previous")}
            </button>

            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-1">
              {t("Admin.PageOf", { current: pagination.current_page, last: pagination.last_page })}
            </span>

            <button
              className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              disabled={!pagination.next_page_url}
              onClick={() => setPage(page + 1)}
            >
              {t("Admin.Next")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuditLog;
