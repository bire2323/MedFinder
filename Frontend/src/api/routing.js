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
      // Normalize GeoJSON coordinates to a flat array of [lat, lng]
      // Support LineString and MultiLineString (and other nested variants)
      let coords = [];

      if (Array.isArray(data.geometry.coordinates)) {
        // If it's a MultiLineString (array of arrays of coordinates), flatten one level
        if (data.geometry.type === 'MultiLineString') {
          coords = data.geometry.coordinates.flat();
        } else {
          // Generic flatten: if elements are themselves arrays of arrays, try to flatten to pairs
          const first = data.geometry.coordinates[0];
          if (Array.isArray(first) && Array.isArray(first[0])) {
            coords = data.geometry.coordinates.flat();
          } else {
            coords = data.geometry.coordinates;
          }
        }
      }

      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng] and ensure numbers
      const points = coords.map(c => [Number(c[1]), Number(c[0])]);
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
