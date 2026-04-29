import { useState, useEffect } from 'react';
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

const sampleUserActivity = [
  { date: 'Mon', patients: 420, hospitalAgents: 45, pharmacyAgents: 78 },
  { date: 'Tue', patients: 380, hospitalAgents: 42, pharmacyAgents: 71 },
  { date: 'Wed', patients: 510, hospitalAgents: 48, pharmacyAgents: 85 },
  { date: 'Thu', patients: 475, hospitalAgents: 50, pharmacyAgents: 80 },
  { date: 'Fri', patients: 550, hospitalAgents: 52, pharmacyAgents: 88 },
  { date: 'Sat', patients: 490, hospitalAgents: 47, pharmacyAgents: 82 },
  { date: 'Sun', patients: 520, hospitalAgents: 51, pharmacyAgents: 86 },
];

const sampleChatbotInteractions = [
  { hour: '00:00', interactions: 45 },
  { hour: '04:00', interactions: 23 },
  { hour: '08:00', interactions: 156 },
  { hour: '12:00', interactions: 234 },
  { hour: '16:00', interactions: 198 },
  { hour: '20:00', interactions: 142 },
];

const sampleTopServices = [
  { name: 'Emergency Care', requests: 1234 },
  { name: 'General Consultation', requests: 987 },
  { name: 'Pharmacy Lookup', requests: 856 },
  { name: 'Lab Tests', requests: 743 },
  { name: 'Specialist Referral', requests: 621 },
];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Admin.AnalyticsDashboard")}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            {t("Admin.AnalyticsDesc")}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-slate-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition"
        >
          <option value="7d">{t("Admin.Last7Days")}</option>
          <option value="30d">{t("Admin.Last30Days")}</option>
          <option value="90d">{t("Admin.Last90Days")}</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.TotalUsers")}</p>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Users className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
            <TrendingUp className="size-3" />
            {t("Admin.FromLastPeriod", { value: overview.userGrowth })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.ActiveHospitals")}</p>
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.activeHospitals.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
            <TrendingUp className="size-3" />
            {t("Admin.FromLastPeriod", { value: overview.hospitalGrowth })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.ActivePharmacies")}</p>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.activePharmacies.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
            <TrendingUp className="size-3" />
            {t("Admin.FromLastPeriod", { value: overview.pharmacyGrowth })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.Chats24h")}</p>
            <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <MessageSquare className="size-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.totalChats.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
            <TrendingUp className="size-3" />
            {t("Admin.FromLastPeriod", { value: overview.chatGrowth })}
          </p>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">{t("Admin.UserActivityTrends")}</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{t("Admin.DailyActiveUsers")}</p>
        </div>
        <div className="px-4 pb-5 pt-2 h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.userActivity || sampleUserActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis className="text-xs" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} dot={false} name={t("Common.Roles.Patient")} />
              <Line type="monotone" dataKey="hospitalAgents" stroke="#8b5cf6" strokeWidth={2} dot={false} name={t("Common.Roles.Hospital")} />
              <Line type="monotone" dataKey="pharmacyAgents" stroke="#10b981" strokeWidth={2} dot={false} name={t("Common.Roles.Pharmacy")} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t("Admin.ChatbotInteractions")}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{t("Admin.UsageByHour")}</p>
          </div>
          <div className="px-4 pb-5 pt-2 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.chatbotInteractions || sampleChatbotInteractions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="interactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t("Admin.Interactions") || "Interactions"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t("Admin.TopServices")}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{t("Admin.MostRequested")}</p>
          </div>
          <div className="px-4 pb-5 pt-2 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topServices || sampleTopServices} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="requests" fill="#10b981" radius={[0, 4, 4, 0]} name={t("Admin.Requests")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">{t("Admin.PeakActivityTime")}</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl shrink-0">
              <Calendar className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics?.insights?.peakHour || t("Admin.PeakHour")}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t("Admin.MostActiveHour")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">{t("Admin.AvgResponseTime")}</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl shrink-0">
              <MessageSquare className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics?.insights?.avgResponseTime || 2.3}s</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t("Admin.ChatbotResponse")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">{t("Admin.UserSatisfaction")}</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl shrink-0">
              <TrendingUp className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics?.insights?.userSatisfaction || 94.5}%</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t("Admin.PositiveFeedback")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
