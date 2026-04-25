import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (initialized) => set({ initialized }),
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