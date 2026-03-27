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
import { getSystemStats } from '../../api/admin';
import useAuthStore from '../../store/UserAuthStore';
import { useTranslation } from 'react-i18next';

// Sample data for charts when no backend analytics; can be replaced by real API later
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
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (token) loadStats();
  }, [token, timeRange]);

  const loadStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getSystemStats(token);
      setStats(data);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const overview = {
    totalUsers: stats?.total_users ?? 0,
    activeHospitals: stats?.total_hospitals ?? 0,
    activePharmacies: stats?.total_pharmacies ?? 0,
    totalChats: stats?.chat_interactions_24h ?? 0,
    userGrowth: 12.5,
    hospitalGrowth: 8.3,
    pharmacyGrowth: 15.2,
    chatGrowth: 22.1,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t("Admin.AnalyticsDashboard")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("Admin.AnalyticsDesc")}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="7d">{t("Admin.Last7Days")}</option>
          <option value="30d">{t("Admin.Last30Days")}</option>
          <option value="90d">{t("Admin.Last90Days")}</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("Admin.TotalUsers")}</h3>
            <Users className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-semibold">{overview.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            <TrendingUp className="size-3 inline mr-1" />
            {t("Admin.FromLastPeriod", { value: overview.userGrowth })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("Admin.ActiveHospitals")}</h3>
            <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-semibold">{overview.activeHospitals.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            <TrendingUp className="size-3 inline mr-1" />
            {t("Admin.FromLastPeriod", { value: overview.hospitalGrowth })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("Admin.ActivePharmacies")}</h3>
            <Building2 className="size-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-semibold">{overview.activePharmacies.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            <TrendingUp className="size-3 inline mr-1" />
            {t("Admin.FromLastPeriod", { value: overview.pharmacyGrowth })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("Admin.Chats24h")}</h3>
            <MessageSquare className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-semibold">{overview.totalChats.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            <TrendingUp className="size-3 inline mr-1" />
            {t("Admin.FromLastPeriod", { value: overview.chatGrowth })}
          </p>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 pt-6">
          <h3 className="font-semibold">{t("Admin.UserActivityTrends")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.DailyActiveUsers")}</p>
        </div>
        <div className="p-6 pt-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleUserActivity}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tw-bg-opacity, white)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} name={t("Common.Roles.Patient")} />
              <Line type="monotone" dataKey="hospitalAgents" stroke="#8b5cf6" strokeWidth={2} name={t("Common.Roles.Hospital")} />
              <Line type="monotone" dataKey="pharmacyAgents" stroke="#10b981" strokeWidth={2} name={t("Common.Roles.Pharmacy")} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 pt-6">
            <h3 className="font-semibold">{t("Admin.ChatbotInteractions")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.UsageByHour")}</p>
          </div>
          <div className="p-6 pt-2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleChatbotInteractions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tw-bg-opacity, white)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="interactions" fill="#8b5cf6" name={t("Admin.Interactions") || "Interactions"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 pt-6">
            <h3 className="font-semibold">{t("Admin.TopServices")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.MostRequested")}</p>
          </div>
          <div className="p-6 pt-2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleTopServices} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tw-bg-opacity, white)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="requests" fill="#10b981" name={t("Admin.Requests")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-2">{t("Admin.PeakActivityTime")}</h3>
          <div className="flex items-center gap-3">
            <Calendar className="size-8 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-2xl font-semibold">{t("Admin.PeakHour")}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.MostActiveHour")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-2">{t("Admin.AvgResponseTime")}</h3>
          <div className="flex items-center gap-3">
            <MessageSquare className="size-8 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <p className="text-2xl font-semibold">2.3s</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.ChatbotResponse")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-2">{t("Admin.UserSatisfaction")}</h3>
          <div className="flex items-center gap-3">
            <TrendingUp className="size-8 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="text-2xl font-semibold">94.5%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("Admin.PositiveFeedback")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
