import useAuthStore from "../store/UserAuthStore";
import { apiMe } from "../api/auth";
export const initializeAuth = async () => {
   // console.log("initializeAuth called"); // 👈 ADD THIS
  
    const { setSession, clearSession, setLoading } = useAuthStore.getState();
  
    try {
      setLoading(true);
  
      const res = await apiMe(); // 👈 this should trigger network
  
      //console.log("API response:", res);
  
      setSession(res.user, res.roles);
    } catch (error) {
    //  console.error("Auth error:", error);
      clearSession();
    }
  };