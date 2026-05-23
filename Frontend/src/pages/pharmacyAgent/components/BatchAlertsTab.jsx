import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Bell, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import {
  apiGetBatchAlerts,
  apiAcknowledgeAlert,
  apiResolveAlert,
  apiRunAlertCheck,
} from "../../../api/inventory";

const severityStyles = {
  CRITICAL: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400",
  HIGH: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400",
  LOW: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400",
};

export default function BatchAlertsTab() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetBatchAlerts();
      if (res.success) setAlerts(res.data || []);
    } catch {
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAcknowledge = async (id) => {
    setActingId(id);
    try {
      const res = await apiAcknowledgeAlert(id);
      if (res.success) {
        toast.success("Alert acknowledged");
        fetchAlerts();
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActingId(null);
    }
  };

  const handleResolve = async (id) => {
    setActingId(id);
    try {
      const res = await apiResolveAlert(id);
      if (res.success) {
        toast.success("Alert resolved");
        fetchAlerts();
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActingId(null);
    }
  };

  const handleRunCheck = async () => {
    try {
      await apiRunAlertCheck();
      toast.success("Alert scan completed");
      fetchAlerts();
    } catch {
      toast.error("Scan failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Batch alerts
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Low stock, expiring soon, and expired batches
          </p>
        </div>
        <button
          type="button"
          onClick={handleRunCheck}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all"
        >
          <RefreshCw size={14} />
          Run check
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-bold">No pending alerts</div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/40">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.li
                  key={alert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 shrink-0">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${severityStyles[alert.severity] || severityStyles.MEDIUM}`}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {alert.alert_type?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                          {alert.drug?.brand_name_en || "Drug"}
                          {alert.drug_batch?.batch_number && (
                            <span className="text-slate-400 font-semibold"> · {alert.drug_batch.batch_number}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {alert.notification_message}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {alert.alert_status === "PENDING" && (
                        <button
                          type="button"
                          disabled={actingId === alert.id}
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actingId === alert.id}
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        Resolve
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
