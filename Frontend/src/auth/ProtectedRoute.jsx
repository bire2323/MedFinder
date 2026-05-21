import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";
import { initializeAuth } from "./initAuth";
import { useState, useEffect, useRef } from "react";
import Loading from "../component/SupportiveComponent/Loading";

export default function ProtectedRoute() {
    const isLoading = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [authChecked, setAuthChecked] = useState(false);
    const initCalledRef = useRef(false);

    useEffect(() => {
        // Only initialize auth once
        if (!initCalledRef.current) {
            initCalledRef.current = true;
            const init = async () => {
                await initializeAuth();
                setAuthChecked(true);
            };
            init();
        }
    }, []);

    if (!authChecked || isLoading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}