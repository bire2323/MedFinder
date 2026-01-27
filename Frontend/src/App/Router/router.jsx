import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import OtherLayout from "../layout/OtherLayout";
import HomePage from "../../pages/home/HomePage";
import MapPage from "../../pages/map/MapPage";
import PharmacyDashboard from "../../pages/pharmacyAgent/PharmacyDashboard";
import LoginRoute from "../Router/LoginRoute";
import RegisterRoute from "../Router/RegisterRoute";
import VerifyOtp from "../../pages/verifyOtp";

import LoginForm from "../../pages/LoginForm";
import RegisterationForm from "../../pages/RegistrationForm";
import ResettingPassword from "../../pages/ResettingPassword";
import ResetForm from "../../pages/ResetForm";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

export const router = createBrowserRouter([
  // Group 1: Routes that use MainLayout
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/map",
        element: <MapPage />,
      },
      {
  path: "login",
  element:<LoginRoute/>,
   children: [
          { index: true, element: <LoginForm /> }, // /login
          { path: "reset-password", element: <ResettingPassword /> }, // /login/reset-password
           { path: "reset-password/get-otp-resetting", element: <ResetForm /> },
           { path: "reset-password/verify-otp", element: <VerifyOtp /> },
        ],
 
},

      {
        path: "register",
        element: <RegisterRoute />, // modal wrapper
        children: [
          { index: true, element: <RegisterationForm /> }, // /register
          { path: "verify-otp", element: <VerifyOtp /> }, // /register/verify-otp
        ],
      },
    ],
  },

  // Group 2: Routes that use OtherLayout (detail pages)
  {
    element: <OtherLayout />,
    children: [
      {
        path: "/pharmacy/detail/:id",
        element: <HomePage />,
      },
      {
        path: "/hospital/detail/:id",
        element: <PharmacyDashboard />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
