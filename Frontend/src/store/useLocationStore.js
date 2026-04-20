import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store for managing user's geographic location
 */
const useLocationStore = create(
  persist(
    (set) => ({
      locationName: "Addis Ababa",
      coordinates: null, // { lat, lng }
      
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
       * Detect current location using browser Geolocation API
       */
      detectLocation: async () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
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
                coordinates: coords 
              });
              resolve(coords);
            },
            (err) => {
              reject(err);
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
        coordinates: null 
      }),
    }),
    {
      name: 'medfinder-location-storage',
    }
  )
);

export default useLocationStore;
