import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  setSession: (user, roles = []) =>
    set({
      user,
      roles: Array.isArray(roles) ? roles : [],
      isAuthenticated: Boolean(user),
      error: null,
      isLoading: false,
    }),

  clearSession: () =>
    set({
      user: null,
      roles: [],
      isAuthenticated: false,
      error: null,
      isLoading: false,
    }),
}));

export default useAuthStore;