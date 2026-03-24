import { useEffect } from "react";
import { initializeAuth } from "../auth/initAuth";
import { apiFetch } from "../api/client";
import useAuthStore from "../store/UserAuthStore";

export default function AuthInitializer() {
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        initializeAuth();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Initial heartbeat
        apiFetch("/api/user/heartbeat", { method: "POST" }).catch(() => {});

        // Set up heartbeat interval (every 60 seconds)
        const interval = setInterval(() => {
            apiFetch("/api/user/heartbeat", { method: "POST" }).catch(() => {});
        }, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    return null;
}