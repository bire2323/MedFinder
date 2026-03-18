import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import HospitalAgentDashboard from "./pages/hospitalagent/HospitalAgentDashboard";
import AdminDashboard from "./pages/adminpage/AdminDashboard";
import Home from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "hospital-agent", Component: HospitalAgentDashboard },
      { path: "admin", Component: AdminDashboard },
    ],
  },
]);
