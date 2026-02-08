// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,                // { id, email, name, role, ... }
            token: null,
            roles: null,           // JWT access token (short-lived)
            // refreshToken: null,     // ← optional, if using refresh tokens
            isAuthenticated: false,
            isLoading: false,          // useful during login/logout/check
            error: null,

            // Actions
            login: (userData, accessToken, userRoles) =>
                set({
                    user: userData,
                    token: accessToken,
                    roles: userRoles,
                    // refreshToken: refreshToken,   // if you have it
                    isAuthenticated: true,
                    error: null,
                    isLoading: false
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    roles: null,
                    // refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                    isLoading: false
                }),

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (err) => set({ error: err, isLoading: false }),

            // Optional: useful for "whoami" / token validation on app start
            initializeAuth: () => {
                const storedToken = get().token;
                if (storedToken) {
                    // You could here validate token with API if needed
                    // or just trust persist (common simple approach)
                    set({ isAuthenticated: true });
                }
            }
        }),

        {
            // Persist configuration
            name: 'medfinder-auth',                   // key in localStorage
            storage: createJSONStorage(() => localStorage), // or sessionStorage
            partialize: (state) => ({                  // ← very important!
                user: state.user,
                token: state.token,
                roles: state.roles,
                isAuthenticated: state.isAuthenticated
                // Do NOT persist: isLoading, error, functions
            }),
            version: 1,                                // helps later with migrations
            // onRehydrateStorage: ...                 // can be used for axios interceptors etc.
        }
    )
);

export default useAuthStore;