import useAuthStore from "../store/UserAuthStore";
import { apiMe } from "../api/auth";
export const initializeAuth = async () => {
  const { setSession, clearSession, setLoading } = useAuthStore.getState();

  try {
    setLoading(true);
    const res = await apiMe();

    if (res.success) {
      setSession(res.user, res.roles);
      return true;
    } else {
      clearSession();
      return false;
    }
  } catch {
    clearSession();
    return false;
  }
};