import { useState, useEffect } from "react";
import { Shield, Users, CheckCircle, BarChart3, Bell, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import UserManagement from "./UserManagement";
import ApprovalManagement from "./ApprovalManagement";
import AnalyticsDashboard from "./AnalyticsDashboard";
import NotificationCenter from "./NotificationCenter";
import { getNotifications } from "../../../api/adminapi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications(true);
      if (response.success) {
        setUnreadNotifications(response.unreadCount);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
              <Shield className="size-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-xl lg:text-2xl">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Platform Management & Oversight
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="size-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <TabsList className="hidden lg:flex w-full justify-start bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="size-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckCircle className="size-4" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="size-4" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <Card className="lg:hidden p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("overview");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BarChart3 className="size-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "users" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("users");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Users className="size-4 mr-2" />
                  User Management
                </Button>
                <Button
                  variant={activeTab === "approvals" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("approvals");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <CheckCircle className="size-4 mr-2" />
                  Approvals
                </Button>
                <Button
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("analytics");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BarChart3 className="size-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("notifications");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Bell className="size-4 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Tab Contents */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Users</h3>
                  <Users className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl">15,847</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +12.5% from last month
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Active Hospitals</h3>
                  <Shield className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-3xl">342</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +8.3% from last month
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Active Pharmacies</h3>
                  <Shield className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl">891</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +15.2% from last month
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</h3>
                  <CheckCircle className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl">3</p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Requires attention
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter onNotificationRead={loadNotifications} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
