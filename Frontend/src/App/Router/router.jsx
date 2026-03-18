/**
 * Application Router Configuration
 * Defines all routes for the MedFinder application
 */
import { createBrowserRouter } from "react-router-dom";

// Layouts
import MainLayout from "../layout/MainLayout";
import OtherLayout from "../layout/OtherLayout";

// Pages
import HomePage from "../../pages/home/HomePage";
import SearchResultsHomePage from "../../pages/home/SearchResultsHomePage";
import MapPage from "../../pages/map/MapPage";
import PharmacyDashboard from "../../pages/pharmacyAgent/PharmacyDashboard";
import HospitalDashboard from "../../pages/hospitalAgent/HospitalDashboard";
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
import { RegistrationWizard } from "../../pages/registration";
import { apiGetFacilities, apiGetHospitals } from "../../api/hospital";
import AdminDashboard from "../../pages/AdminPage/AdminDashboard";
import HomeError from "../../component/HomeError";
import UserDashboard from "../../pages/UserDashboard/UserDashboard";

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
    element: <MainLayout />,

    children: [
      // Home page
      {
        path: "/",
        element: <HomePage />,
        loader: async () => {
          try {
            const res = await apiGetFacilities();

            if (!res.ok) {
              throw new Response("Failed to load hospitals", { status: res.status });
            }

            return res.json();

          } catch (error) {
            throw new Response("Server not reachable", { status: 500 });
          }
        },
        errorElement: <HomeError />
      },
      // Search results home page (after landing search)
      {
        path: "/home",
        element: <SearchResultsHomePage />,
      },
      // Map page
      {
        path: "/map",
        element: <MapPage />,
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

  // ==================== FACILITY REGISTRATION (Standalone Pages) ====================
  {
    path: "/register/pharmacy",
    element: <RegistrationWizard registrationType="pharmacy" />,
  },
  {
    path: "/register/hospital",
    element: <RegistrationWizard registrationType="hospital" />,
  },

  // ==================== AGENT DASHBOARDS (Standalone Pages) ====================
  // Pharmacy Agent Dashboard
  {
    path: "/pharmacy-agent/dashboard",
    element: <PharmacyDashboard />,
  },
  // Hospital Agent Dashboard
  {
    path: "/hospital-agent/dashboard",
    element: <HospitalDashboard />,
  },
  {
    path: "/user/dashboard",
    element: <UserDashboard />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },

  // ==================== FACILITY DETAIL PAGES (OtherLayout) ====================
  {
    element: <OtherLayout />,
    children: [
      // Pharmacy detail page
      {
        path: "/pharmacy/:id",
        element: <FacilityDetailPage />,
        loader: async ({ params }) => {
          const res = await fetch(
            `http://localhost:8000/api/pharmacies/${params.id}`
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
            `http://localhost:8000/api/hospitals/${params.id}`
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
            `http://localhost:8000/api/hospitals/${params.id}`
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

  // ==================== 404 CATCH-ALL ====================
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
