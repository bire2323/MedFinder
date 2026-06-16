import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store for managing user's geographic location and permission state
 * Permission states: 'prompt' | 'granted' | 'denied'
 */
const useLocationStore = create(
  persist(
    (set) => ({
      locationName: "Addis Ababa",
      coordinates: null, // { lat, lng }
      permissionState: "prompt", // 'prompt' | 'granted' | 'denied'
      permissionError: null, // Error message if permission denied
      
      /**
       * Update current location
       * @param {string} name - Human readable name (e.g., "Gondar")
       * @param {Object} coords - { lat, lng } coordinates
       */
      setLocation: (name, coords) => set({ 
        locationName: name, 
        coordinates: coords 
      }),
      
      /**
       * Check if location permission is granted
       */
      checkPermissionStatus: async () => {
        try {
          if (!navigator.permissions) {
            // Fallback if permissions API not available
            return "prompt";
          }
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          set({ permissionState: permission.state });
          return permission.state;
        } catch (err) {
          console.warn("Cannot check permission status:", err);
          return "prompt";
        }
      },
      
      /**
       * Detect current location using browser Geolocation API
       * Handles permission denied cases
       */
      detectLocation: async () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            const error = new Error("Geolocation not supported");
            set({ 
              permissionState: "denied",
              permissionError: error.message 
            });
            reject(error);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = { 
                lat: pos.coords.latitude, 
                lng: pos.coords.longitude 
              };
              set({ 
                locationName: "Current Location", 
                coordinates: coords,
                permissionState: "granted",
                permissionError: null
              });
              resolve(coords);
            },
            (err) => {
              // Handle permission errors
              const errorMessage = err.code === 1 
                ? "Location permission denied. Enable location access in your browser settings."
                : err.code === 2
                ? "Unable to retrieve your location. Please try again."
                : err.message || "Location service unavailable";
              
              set({ 
                permissionState: err.code === 1 ? "denied" : "prompt",
                permissionError: errorMessage,
                coordinates: null
              });
              reject(new Error(errorMessage));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      },

      /**
       * Reset to default
       */
      resetLocation: () => set({ 
        locationName: "Addis Ababa", 
        coordinates: null,
        permissionState: "prompt",
        permissionError: null
      }),
      
      /**
       * Manually set permission as denied
       */
      setPermissionDenied: (errorMsg) => set({
        permissionState: "denied",
        permissionError: errorMsg,
        coordinates: null
      }),
    }),
    {
      name: 'medfinder-location-storage',
    }
  )
);

export default useLocationStore;
