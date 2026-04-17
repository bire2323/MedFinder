import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";
import { initializeAuth } from "./initAuth";
import { useState, useEffect } from "react";
import Loading from "../component/SupportiveComponent/Loading";

export default function ProtectedRoute() {
    const { isLoading } = useAuthStore((state) => state.isLoading);

    useEffect(() => {
        const init = async () => {
            const result = await initializeAuth();
            //console.log(result);
            if (!result) {
                return <Navigate to="/login" replace />;
            }
        };
        init();
    }, []);
    if (isLoading) {
        return <Loading />;
    }


    return <Outlet />;
}