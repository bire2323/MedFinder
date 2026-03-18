import { useState, useEffect } from "react";
import { Building2, MapPin, Users, Settings, MessageSquare, LogOut, Menu, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import HospitalManagement from "./HospitalManagement";
import DepartmentManagement from "./DepartmentManagement";
import ProfileManagement from "./ProfileManagement";
import MapView from "./MapView";
import ChatWindow from "../pharmacyagent/chatwindow";
import { getHospitalInfo, getVerificationStatus } from "../../../api/hospital";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";

export default function HospitalAgentDashboard() {
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [hospitalResponse, verificationResponse] = await Promise.all([
        getHospitalInfo(),
        getVerificationStatus(),
      ]);
      
      if (hospitalResponse.success) {
        setHospitalInfo(hospitalResponse.data);
      }
      if (verificationResponse.success) {
        setVerificationStatus(verificationResponse.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <Building2 className="size-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-xl lg:text-2xl">
                  {hospitalInfo?.name || "Hospital Dashboard"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Hospital Agent Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {verificationStatus?.hospitalVerified && (
                <Badge variant="default" className="hidden sm:flex">
                  Verified
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsChatOpen(true);
                  setIsChatMinimized(false);
                }}
              >
                <MessageSquare className="size-5" />
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
              <Building2 className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="hospital" className="flex items-center gap-2">
              <Settings className="size-4" />
              Hospital Info
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Users className="size-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="size-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="size-4" />
              Profile
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
                  <Building2 className="size-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "hospital" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("hospital");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="size-4 mr-2" />
                  Hospital Info
                </Button>
                <Button
                  variant={activeTab === "departments" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("departments");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Users className="size-4 mr-2" />
                  Departments
                </Button>
                <Button
                  variant={activeTab === "map" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("map");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <MapPin className="size-4 mr-2" />
                  Location
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab("profile");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="size-4 mr-2" />
                  Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Tab Contents */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Beds</h3>
                  <Building2 className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl">{hospitalInfo?.totalBeds || 0}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {hospitalInfo?.availableBeds || 0} Available
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Rating</h3>
                  <Users className="size-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-3xl">{hospitalInfo?.rating || 0} ⭐</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Status</h3>
                  <Settings className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl capitalize">{hospitalInfo?.verificationStatus || "Pending"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  License: {hospitalInfo?.licenseNumber}
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hospital">
            <HospitalManagement 
              hospitalInfo={hospitalInfo} 
              onUpdate={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="map">
            <MapView hospitalInfo={hospitalInfo} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
      />
    </div>
  );
}
