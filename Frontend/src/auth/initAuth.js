import useAuthStore from "../store/UserAuthStore";
import { apiMe } from "../api/auth";

export const initializeAuth = async () => {
  const { setSession, clearSession, setLoading, setInitialized } = useAuthStore.getState();

  try {
    setLoading(true);
    const res = await apiMe();

    if (res && res.success) {
      setSession(res.user, res.roles);
      return true;
    } else {
      clearSession();
      return false;
    }
  } catch {
    clearSession();
    return false;
  } finally {
    setInitialized(true);
    setLoading(false);
  }
};