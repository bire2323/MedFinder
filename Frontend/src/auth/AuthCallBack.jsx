import { useEffect, useContext } from "react";
import { apiMe } from "../api/auth";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";
import { navigateByRole } from "../utils/UserNavigation";
import { ensureCsrfCookie } from "../api/client";
import Loading from "../component/SupportiveComponent/Loading";

export default function AuthCallback() {
    const navigate = useNavigate();

    const { setSession, clearSession, setLoading } = useAuthStore();
    const { user, roles } = useAuthStore();
    useEffect(() => {
        const getUser = async () => {
            try {
                setLoading(true);

                const res = await apiMe();
                if (res.success) {
                    setSession(res.user, res.roles);
                    if (res.user?.status === "inactive") {
                        clearSession();
                        navigate("/");
                    }
                    navigateByRole(res?.roles, navigate);
                    return true;
                } else {
                    clearSession();
                    return false;
                }
            } catch {
                clearSession();
                return false;
            }
        }
        getUser();

    }, [navigate, setLoading, setSession, clearSession]);

    return (
        <Loading />
    );
}