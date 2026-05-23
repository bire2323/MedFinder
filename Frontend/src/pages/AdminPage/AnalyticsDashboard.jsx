import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Building2,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getSystemStats, getAnalytics } from '../../api/admin';
import useAuthStore from '../../store/UserAuthStore';
import { useTranslation } from 'react-i18next';
import Loading from '../../component/SupportiveComponent/Loading';


const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
};

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (user) loadData();
  }, [user, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, analyticsData] = await Promise.all([
        getSystemStats(),
        getAnalytics(timeRange)
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
      setStats(null);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const overview = analytics?.overview || {
    totalUsers: 0,
    activeHospitals: 0,
    activePharmacies: 0,
    totalChats: 0,
    userGrowth: 12.5,
    hospitalGrowth: 8.3,
    pharmacyGrowth: 15.2,
    chatGrowth: 22.1,
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white uppercase tracking-wider">{t("Admin.AnalyticsDashboard")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("Admin.AnalyticsDesc")}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-sm"
        >
          <option value="7d">{t("Admin.Last7Days")}</option>
          <option value="30d">{t("Admin.Last30Days")}</option>
          <option value="90d">{t("Admin.Last90Days")}</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="bg-gradient-to-br from-indigo-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("Admin.TotalUsers")}</p>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Users className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-850 dark:text-white leading-none">{overview.totalUsers.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <TrendingUp className="size-3 shrink-0" />
            {t("Admin.FromLastPeriod", { value: overview.userGrowth })}
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="bg-gradient-to-br from-blue-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("Admin.ActiveHospitals")}</p>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
              <Building2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-850 dark:text-white leading-none">{overview.activeHospitals.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <TrendingUp className="size-3 shrink-0" />
            {t("Admin.FromLastPeriod", { value: overview.hospitalGrowth })}
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="bg-gradient-to-br from-emerald-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("Admin.ActivePharmacies")}</p>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Building2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-850 dark:text-white leading-none">{overview.activePharmacies.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <TrendingUp className="size-3 shrink-0" />
            {t("Admin.FromLastPeriod", { value: overview.pharmacyGrowth })}
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="bg-gradient-to-br from-purple-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.Chats24h")}</p>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-100 dark:border-purple-800/50 text-purple-650 dark:text-purple-405">
              <MessageSquare className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-850 dark:text-white leading-none">{overview.totalChats.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <TrendingUp className="size-3 shrink-0" />
            {t("Admin.FromLastPeriod", { value: overview.chatGrowth })}
          </p>
        </motion.div>
      </div>

      {/* User Activity Chart */}
      <motion.div 
        variants={cardVariants}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/65">
          <h3 className="font-bold text-slate-850 dark:text-white text-sm uppercase tracking-wider">{t("Admin.UserActivityTrends")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("Admin.DailyActiveUsers")}</p>
        </div>
        <div className="px-4 pb-5 pt-4 h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.userActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-800 opacity-60" />
              <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis className="text-xs" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                  fontSize: '11px',
                  color: 'white',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2.5} dot={false} name={t("Common.Roles.Patient")} />
              <Line type="monotone" dataKey="hospitalAgents" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name={t("Common.Roles.Hospital")} />
              <Line type="monotone" dataKey="pharmacyAgents" stroke="#10b981" strokeWidth={2.5} dot={false} name={t("Common.Roles.Pharmacy")} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div 
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/65">
            <h3 className="font-bold text-slate-850 dark:text-white text-sm uppercase tracking-wider">{t("Admin.ChatbotInteractions")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("Admin.UsageByHour")}</p>
          </div>
          <div className="px-4 pb-5 pt-4 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.chatbotInteractions || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-800 opacity-60" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                    fontSize: '11px',
                    color: 'white',
                  }}
                />
                <Bar dataKey="interactions" fill="#8b5cf6" radius={[6, 6, 0, 0]} name={t("Admin.Interactions") || "Interactions"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/65">
            <h3 className="font-bold text-slate-850 dark:text-white text-sm uppercase tracking-wider">{t("Admin.TopServices")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("Admin.MostRequested")}</p>
          </div>
          <div className="px-4 pb-5 pt-4 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topServices || []} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-800 opacity-60" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                    fontSize: '11px',
                    color: 'white',
                  }}
                />
                <Bar dataKey="requests" fill="#10b981" radius={[0, 6, 6, 0]} name={t("Admin.Requests")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-5.5 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4">{t("Admin.PeakActivityTime")}</h3>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl shrink-0 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
              <Calendar className="size-5" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-white leading-tight">{analytics?.insights?.peakHour || t("Admin.PeakHour")}</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{t("Admin.MostActiveHour")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-5.5 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4">{t("Admin.AvgResponseTime")}</h3>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl shrink-0 border border-purple-100 dark:border-purple-800/30 text-purple-650 dark:text-purple-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-white leading-tight">{analytics?.insights?.avgResponseTime || 2.3}s</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{t("Admin.ChatbotResponse")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-5.5 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4">{t("Admin.UserSatisfaction")}</h3>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl shrink-0 border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-white leading-tight">{analytics?.insights?.userSatisfaction || 94.5}%</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{t("Admin.PositiveFeedback")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
