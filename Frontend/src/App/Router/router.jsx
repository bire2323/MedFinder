/**
 * Application Router Configuration
 * Defines all routes for the MedFinder application
 */
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../layout/MainLayout";
import OtherLayout from "../layout/OtherLayout";

// Pages
import HomePage from "../../pages/home/HomePage";
import SearchResultsHomePage from "../../pages/home/SearchResultsHomePage";
import SearchDepartmentService from "../../pages/home/SearchDepartmentService";
import PrescriptionReader from "../../pages/prescription/PrescriptionReader";
import MapPage from "../../pages/map/MapPage";
import PharmacyDashboard from "../../pages/pharmacyAgent/PharmacyDashboard";
import PharmacyInventory from "../../pages/pharmacyAgent/Inventory";
import PharmacyOverviewTab from "../../pages/pharmacyAgent/components/OverviewTab";
import PharmacyChatsTab from "../../pages/pharmacyAgent/components/ChatsTab";

import HospitalDashboard from "../../pages/hospitalAgent/HospitalDashboard";
import HospitalOverviewTab from "../../pages/hospitalAgent/components/OverviewTab";
import HospitalDepartmentsTab from "../../pages/hospitalAgent/components/DepartmentsTab";
import HospitalServicesTab from "../../pages/hospitalAgent/components/ServicesTab";
import HospitalChatsTab from "../../pages/hospitalAgent/components/ChatsTab";

import FacilityDetailPage from "../../pages/FacilityDetailPage";

// Auth Pages
import LoginRoute from "../Router/LoginRoute";
import RegisterRoute from "../Router/RegisterRoute";
import VerifyOtp from "../../pages/VerifyOtp";
import LoginForm from "../../pages/LoginForm";
import RegisterationForm from "../../pages/RegistrationForm";
import ResettingPassword from "../../pages/ResettingPassword";
import ResetForm from "../../pages/ResetForm";

// Registration Wizard
import {
  RegistrationWizard,
  Step1BasicInfo,
  Step2Location,
  Step4ReviewAndSubmit,
  SuccessScreen
} from "../../pages/registration";
import AdminDashboard from "../../pages/AdminPage/AdminDashboard";
import AdminOverview from "../../pages/AdminPage/AdminOverview";
import AdminUserManagement from "../../pages/AdminPage/UserManagement";
import AdminApprovalManagement from "../../pages/AdminPage/ApprovalManagement";
import AdminAnalyticsDashboard from "../../pages/AdminPage/AnalyticsDashboard";
import AuditLog from "../../pages/AdminPage/AuditLog";
import AdminNotificationCenter from "../../pages/AdminPage/NotificationCenter";
import ProfileSettingsLayout from "../../pages/shared/ProfileSettings/ProfileSettingsLayout";
import UserDashboard from "../../pages/UserDashboard/UserDashboard";
import UserOverview from "../../pages/UserDashboard/components/UserOverview";
import UserFavorites from "../../pages/UserDashboard/components/UserFavorites";
import MapView from "../../pages/UserDashboard/components/MapView";
import Profile from "../../pages/UserDashboard/components/Profile";
import Chat from "../../pages/UserDashboard/components/Chat";

import ProtectedRoute from "../../auth/ProtectedRoute";
import AuthCallback from "../../auth/AuthCallBack";
import ScrollToTop from "../../component/ScrollToTop";
import Step3Selector from "../../pages/registration/Step3Selector";
import TermsConditions from "../../component/Terms&Conditions";

// 404 Component
function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-slate-300 dark:text-gray-700 mb-4">404</h1>
      <p className="text-xl text-slate-600 dark:text-gray-400 mb-6">Page Not Found</p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
      >
        Go Home
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  // ==================== PUBLIC ROUTES (MainLayout) ====================
  {
    element: <>
      <ScrollToTop />
      <MainLayout />
    </>,

    children: [
      // Home page
      {
        path: "/",
        element: <HomePage />,
      },
      // Search results home page (after landing search)
      {
        path: "/home/search",
        element: <SearchResultsHomePage />,
      },
      {
        path: "/search-department-service",
        element: <SearchDepartmentService />,
      },
      {
        path: "/prescription-reader",
        element: <PrescriptionReader />,
      },
      // Map page
      {
        path: "/home/map",
        element: <MapPage />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />
      },

      // Login routes
      {
        path: "login",
        element: <LoginRoute />,
        children: [
          { index: true, element: <LoginForm /> },
          { path: "reset-password", element: <ResettingPassword /> },
          { path: "reset-password/get-otp-resetting", element: <ResetForm /> },
          { path: "reset-password/verify-otp", element: <VerifyOtp /> },
        ],
      },
      // Basic user registration
      {
        path: "register",
        element: <RegisterRoute />,
        children: [
          { index: true, element: <RegisterationForm /> },
          { path: "verify-otp", element: <VerifyOtp /> },
        ],
      },
    ],
  },

  // ==================== FACILITY REGISTRATION (Nested Route-Based) ====================
  {
    path: "/register/:type",
    element: (
      <>
        <ScrollToTop />
        <RegistrationWizard />
      </>
    ),
    children: [
      { index: true, element: <Step1BasicInfo /> },
      { path: "basic-info", element: <Step1BasicInfo /> },
      { path: "location-info", element: <Step2Location /> },
      { path: "verification-info", element: <Step3Selector /> }, // Will handle logic in wizard/outlet
      { path: "review", element: <Step4ReviewAndSubmit /> },
      { path: "success", element: <SuccessScreen /> },
    ]
  },

  // ==================== AGENT DASHBOARDS (Nested Routes) ====================
  // Pharmacy Agent Dashboard
  {
    path: "/pharmacy/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <PharmacyDashboard />, children: [
          { index: true, element: <PharmacyOverviewTab /> },
          { path: "overview", element: <PharmacyOverviewTab /> },
          { path: "inventory", element: <PharmacyInventory /> },
          { path: "chats", element: <PharmacyChatsTab /> },
          { path: "settings", element: <ProfileSettingsLayout type="pharmacy" /> },
        ]
      }
    ],
  },
  // Hospital Agent Dashboard
  {
    path: "/hospital/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <HospitalDashboard />, children: [
          { index: true, element: <HospitalOverviewTab /> },
          { path: "overview", element: <HospitalOverviewTab /> },
          { path: "departments", element: <HospitalDepartmentsTab /> },
          { path: "services", element: <HospitalServicesTab /> },
          { path: "chats", element: <HospitalChatsTab /> },
          { path: "settings", element: <ProfileSettingsLayout type="hospital" /> },
        ]
      }
    ],
  },
  // User Dashboard
  {
    path: "/user/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserDashboard />, children: [
          { index: true, element: <UserOverview /> },
          { path: "overview", element: <UserOverview /> },
          { path: "search", element: <MapView /> },
          { path: "favorites", element: <UserFavorites /> },
          { path: "messages", element: <Chat /> },
          { path: "profile", element: <Profile /> },
        ]
      }
    ],
  },
  // Admin Dashboard
  {
    path: "/admin/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminDashboard />, children: [
          { index: true, element: <AdminOverview /> },
          { path: "overview", element: <AdminOverview /> },
          { path: "users", element: <AdminUserManagement /> },
          { path: "approvals", element: <AdminApprovalManagement /> },
          { path: "analytics", element: <AdminAnalyticsDashboard /> },
          { path: "auditlog", element: <AuditLog /> },
          { path: "notifications", element: <AdminNotificationCenter /> },
          { path: "settings", element: <Profile /> },
        ]
      }
    ],
  },
  // Backward compatibility redirects
  { path: "/pharmacy-agent/dashboard", element: <Navigate to="/pharmacy/dashboard" replace /> },
  { path: "/hospital-agent/dashboard", element: <Navigate to="/hospital/dashboard" replace /> },

  {
    path: "/terms-and-conditions",
    element: <TermsConditions />,
  },
  // ==================== FACILITY DETAIL PAGES (OtherLayout) ====================
  {
    element: (
      <>
        <ScrollToTop />
        <OtherLayout />
      </>
    ),
    children: [
      // Pharmacy detail page
      {
        path: "/pharmacy/:id",
        element: <FacilityDetailPage />,
        loader: async ({ params }) => {
          const res = await fetch(
            `https://medfinder.com/api/pharmacies/${params.id}`
          );

          if (!res.ok) {
            throw new Response("Pharmacy not found", { status: 404 });
          }

          const json = await res.json();
          return {
            type: "pharmacy",
            data: json.data,
          };
        },
      },
      // Hospital detail page
      {
        path: "/hospital/:id",
        element: <FacilityDetailPage />,
        loader: async ({ params }) => {
          const res = await fetch(
            `https://medfinder.com/api/hospitals/${params.id}`
          );

          if (!res.ok) {
            throw new Response("hospital not found", { status: 404 });
          }

          const json = await res.json();
          return {
            type: "hospital",
            data: json.data,
          };
        },
      },
      // Legacy routes (keeping for backward compatibility)
      {
        path: "/pharmacy/detail/:id",
        element: <FacilityDetailPage />,
        loader: async ({ params }) => {
          return fetch(`/api/pharmacies/${params.id}`).then(r => r.json());
        }

      },
      {
        path: "/hospital/detail/:id",
        element: <FacilityDetailPage />,
        loader: async ({ params }) => {
          const res = await fetch(
            `https://medfinder.com/api/hospitals/${params.id}`
          );

          if (!res.ok) {
            throw new Response("Hospital not found", { status: 404 });
          }

          const json = await res.json();
          return json.data;
        },
      }
    ],
  },


  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
