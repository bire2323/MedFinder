import { Users, Shield, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

export default function AdminOverview() {
  const { t } = useTranslation();
  const { stats, loading } = useOutletContext();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            {t("Admin.TotalUsers")}
          </p>
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Users className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.totalUsers ?? 0).toLocaleString()}
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">{t("Admin.PlatformUsers")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            {t("Admin.ActiveHospitals")}
          </p>
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <Shield className="size-4 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.totalHospitals ?? 0).toLocaleString()}
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">{t("Admin.Registered")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            {t("Admin.ActivePharmacies")}
          </p>
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
            <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.totalPharmacies ?? 0).toLocaleString()}
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">{t("Admin.WithInventory")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            {t("Admin.PendingApprovals")}
          </p>
          <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <CheckCircle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {loading ? <span className="text-slate-300 dark:text-gray-600 animate-pulse">—</span> : (stats?.pendingApprovals ?? 0)}
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">{t("Admin.RequiresAttention")}</p>
      </div>
    </div>
  );
}
