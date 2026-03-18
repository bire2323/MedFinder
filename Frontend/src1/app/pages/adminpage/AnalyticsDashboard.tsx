import { useState, useEffect } from "react";
import { TrendingUp, Users, Building2, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAnalytics } from "../../../api/adminapi";
import { toast } from "sonner";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getAnalytics(timeRange);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl">Analytics Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Platform performance and user activity metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="size-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="size-3 inline mr-1" />
              +{analytics.overview.userGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Hospitals</CardTitle>
            <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.overview.activeHospitals.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="size-3 inline mr-1" />
              +{analytics.overview.hospitalGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Pharmacies</CardTitle>
            <Building2 className="size-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.overview.activePharmacies.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="size-3 inline mr-1" />
              +{analytics.overview.pharmacyGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Chats</CardTitle>
            <MessageSquare className="size-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{analytics.overview.totalChats.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="size-3 inline mr-1" />
              +{analytics.overview.chatGrowth}% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Trends</CardTitle>
          <CardDescription>Daily active users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="Patients"
                />
                <Line 
                  type="monotone" 
                  dataKey="hospitalAgents" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  name="Hospital Agents"
                />
                <Line 
                  type="monotone" 
                  dataKey="pharmacyAgents" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Pharmacy Agents"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chatbot Interactions */}
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Interactions</CardTitle>
            <CardDescription>AI assistant usage by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.chatbotInteractions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="interactions" fill="#8b5cf6" name="Interactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>Most requested services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    className="text-xs" 
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="requests" fill="#10b981" name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak Activity Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Calendar className="size-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl">12:00 PM</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Most active hour</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <MessageSquare className="size-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl">2.3s</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chatbot response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingUp className="size-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl">94.5%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Positive feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
