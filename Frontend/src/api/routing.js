import { apiFetch } from "./client";

/**
 * Fetches a route between two points from the backend.
 * @param {Array} from [lat, lng]
 * @param {Array} to [lat, lng]
 * @param {Object} options { signal }
 * @returns {Promise<Object>} The route data
 */
export async function apiFetchRoute(from, to, { signal } = {}) {
  if (!from || !to) return null;

  try {
    const data = await apiFetch(`/api/map/route?from=${from[0]},${from[1]}&to=${to[0]},${to[1]}&steps=${true}`, { signal });
    
    if (data && data.geometry) {
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const points = data.geometry.coordinates.map(c => [c[1], c[0]]);
      return { ...data, points };
    }

    return null;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error("apiFetchRoute Error:", error);
    throw error;
  }
}

/**
 * Performs a "smart" search that finds the nearest pharmacy for a drug and returns a route.
 * @param {Array} from [lat, lng]
 * @param {string} drugName 
 * @param {Object} options { signal }
 * @returns {Promise<Object>} The search result with pharmacy and route
 */
export async function apiSmartPharmacySearch(from, drugName, { signal } = {}) {
  if (!from || !drugName) return null;

  try {
    const data = await apiFetch(`/api/smart-pharmacy?from=${from[0]},${from[1]}&drug=${encodeURIComponent(drugName)}`, { signal });
    
    if (data.success && data.route && data.route.geometry) {
      // Normalize points for Leaflet
      data.route.points = data.route.geometry.coordinates.map(c => [c[1], c[0]]);
    }
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error("apiSmartPharmacySearch Error:", error);
    throw error;
  }
}
