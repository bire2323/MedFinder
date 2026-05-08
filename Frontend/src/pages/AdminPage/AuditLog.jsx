import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Calendar,
  Filter,
  MoreHorizontal,
  ArrowRight,
  Users,
  ShoppingBag,
  CreditCard,
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
  Cherry,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { AllAuditLog } from "../../api/admin";

const CATEGORIES = [
  { id: "ALL", labelKey: "Admin.AuditLogCategories.ALL", icon: null },
  { id: "auth", labelKey: "Admin.AuditLogCategories.auth", icon: Shield, color: "text-blue-600 bg-blue-50" },
  { id: "user", labelKey: "Admin.AuditLogCategories.user", icon: Users, color: "text-sky-600 bg-sky-50" },
  { id: "hospital", labelKey: "Admin.AuditLogCategories.hospital", icon: Boxes, color: "text-purple-600 bg-purple-50" },
  { id: "pharmacy", labelKey: "Admin.AuditLogCategories.pharmacy", icon: ShoppingBag, color: "text-green-600 bg-green-50" },
  { id: "inventory", labelKey: "Admin.AuditLogCategories.inventory", icon: Tag, color: "text-orange-600 bg-orange-50" },
  { id: "department", labelKey: "Admin.AuditLogCategories.department", icon: Users, color: "text-indigo-600 bg-indigo-50" },
  { id: "security", labelKey: "Admin.AuditLogCategories.security", icon: ShieldAlert, color: "text-red-600 bg-red-50" },
  { id: "system", labelKey: "Admin.AuditLogCategories.system", icon: Activity, color: "text-gray-600 bg-gray-100" },
];
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
  }, [page, searchTerm, activeCategory, startDate, endDate]);

  // Filtering Logic
  const handleDownload = () => {
    const url = `/api/audit-logs/export?search=${searchTerm}&category=${activeCategory}&start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  const renderStatus = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <CheckCircle size={10} /> {t("Admin.StatusSuccess")}
          </span>
        );
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle size={10} /> {t("Admin.StatusCritical")}
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
            <AlertTriangle size={10} /> {t("Admin.StatusWarning")}
          </span>
        );
      default:
        return <span className="text-gray-500 text-xs">{status}</span>;
    }
  };

  // Helper: Get Icon Component based on category string
  const getCategoryConfig = (catString) => {
    return CATEGORIES.find((c) => c.id === catString) || CATEGORIES[8];
  };

  return (
    <div className="space-y-6 px-5 py-8">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("Admin.AuditLog")}</h2>
          <p className="text-sm text-gray-500 dark:text-white/90">
            {t("Admin.AuditLogDesc")}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button className="flex items-center gap-2 px-3 py-1 bg-white dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <input
              type="date"
              className="outline-0"
              name="startDate"
              id="Start Date"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </button>
          <span>{t("Admin.DateTo")}</span>
          <button className="flex items-center gap-2 px-3 py-1 bg-white dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <input
              type="date"
              className="outline-0"
              name="endDate"
              id="End Date"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </button>
          {/* <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm
          "
            onClick={handleDownload}
          >
            <Download size={16} /> Export Logs
          </button> */}
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
        <div className="flex space-x-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center dark:bg-gray-600 dark:text-white gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border
                  ${isActive
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {Icon && (
                  <Icon
                    size={16}
                    className={isActive ? "text-blue-600" : "text-gray-400 "}
                  />
                )}
                {t(cat.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border dark:bg-gray-600 border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={t("Admin.SearchEventsPlaceholder")}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-500 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:text-white dark:bg-gray-600 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">{t("Admin.EventType")}</th>
                <th className="px-6 py-4">{t("Admin.Description")}</th>
                <th className="px-6 py-4">{t("Admin.UserIdIp")}</th>
                <th className="px-6 py-4">{t("Admin.DateTime")}</th>
                <th className="px-6 py-4">{t("Admin.Status")}</th>
                <th className="px-6 py-4 text-right">{t("Admin.Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:bg-gray-500">
              {auditLog.length > 0 ? (
                auditLog.map((log) => {
                  const config = getCategoryConfig(log.category);
                  const CatIcon = config.icon;

                  return (
                    <>
                      <tr
                        key={log.id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.color}`}>
                              <CatIcon size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                {log.event}
                              </p>
                              <span className="text-xs text-gray-500  dark:text-white font-medium bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                {t(config.labelKey)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-white">
                            {log.detail}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-white">
                              {log.user_id}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-white font-mono">
                              {log.ip_address}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-white whitespace-nowrap">
                            {dayjs(log.created_at).format("YYYY-MM-DD")}{" "}
                            <span>/</span>
                            {dayjs(log.created_at).format("HH:mm:ss")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {renderStatus(log.event_status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {openedId !== log.id ? (
                            <button
                              className="text-gray-400 dark:text-white hover:text-blue-600 transition-colors"
                              onClick={() => {
                                toggleMetadata(log.id);
                                setOpenedId(log.id);
                              }}
                            >
                              <ChevronRight size={18} />
                            </button>
                          ) : (
                            <button
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              onClick={() => {
                                toggleMetadata(log.id);
                                setOpenedId(0);
                              }}
                            >
                              <ChevronDown size={18} />
                            </button>
                          )}
                        </td>
                      </tr>

                      {expandedRowId === log.id && (
                        <tr className="bg-blue-50/10">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="bg-white border dark:bg-gray-500 border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-700 dark:text-white/90">
                                  {t("Admin.Details")}
                                </h4>
                                <button
                                  onClick={() => setExpandedRowId(null)}
                                  className="text-gray-400 dark:text-white/90 hover:text-gray-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              {Object.keys(log.metadata).length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {Object.entries(log.metadata).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-start border-b border-gray-100 dark:bg-gray-500 pb-2 last:border-0"
                                      >
                                        <div className="w-1/4 text-sm font-medium text-gray-600 dark:text-white/90">
                                          {key}:
                                        </div>
                                        <div className="w-3/4 text-sm">
                                          {typeof value === "object" ? (
                                            <pre className="text-xs bg-gray-50 dark:bg-gray-500 dark:text-white/90 p-2 rounded">
                                              {JSON.stringify(value, null, 2)}
                                            </pre>
                                          ) : (
                                            <span className="text-gray-800 dark:text-white/90">
                                              {String(value)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-center py-4">
                                  {t("Admin.NoMetadataAvailable")}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search size={40} className="mb-2 opacity-20" />
                      <p>{t("Admin.NoAuditLogsFound")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 dark:bg-gray-500 p-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-white/90">
            {t("Admin.ShowingEvents", { count: auditLog.length })}
          </span>

          <div style={{ marginTop: "20px" }}>
            <button
              className="px-3 py-1 text-xs font-medium border rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={!pagination.prev_page_url}
              onClick={() => setPage(page - 1)}
            >
              {t("Admin.Previous")}
            </button>

            <span className="my-0 mx-2.5 text-sm">
              {t("Admin.PageOf", { current: pagination.current_page, last: pagination.last_page })}
            </span>

            <button
              className="px-3 py-1 text-xs font-medium border rounded hover:bg-gray-50"
              disabled={!pagination.next_page_url}
              onClick={() => setPage(page + 1)}
            >
              {t("Admin.Next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
