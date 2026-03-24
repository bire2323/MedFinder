import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();
    //console.log("auth", isAuthenticated);
    if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div></div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}