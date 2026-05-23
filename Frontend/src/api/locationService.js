/**
 * Location API Service
 * Handles all location-related API calls for regions, cities, and location management
 */
import { apiFetch, ensureCsrfCookie } from "./client";

/**
 * Get all active regions
 * @returns {Promise<Object>} - API response with regions array
 */
export async function getActiveRegions() {
  return apiFetch("/api/regions", {
    method: "GET",
  });
}

/**
 * Get cities by region
 * @param {number} regionId - The region ID
 * @returns {Promise<Object>} - API response with cities array
 */
export async function getCitiesByRegion(regionId) {
  return apiFetch(`/api/regions/${regionId}/cities`, {
    method: "GET",
  });
}

// ============== ADMIN ENDPOINTS ==============

/**
 * Get all regions with pagination and search (admin)
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} search - Search term
 * @returns {Promise<Object>} - API response with regions and pagination
 */
export async function listRegions(page = 1, perPage = 15, search = "") {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (perPage) params.append("per_page", perPage);
  if (search) params.append("search", search);

  return apiFetch(`/api/admin/regions?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Create a new region (admin)
 * @param {Object} data - Region data {name_en, name_am, code, is_active}
 * @returns {Promise<Object>} - API response with created region
 */
export async function createRegion(data) {
  await ensureCsrfCookie();
  return apiFetch("/api/admin/regions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Get a specific region (admin)
 * @param {number} regionId - Region ID
 * @returns {Promise<Object>} - API response with region data
 */
export async function getRegion(regionId) {
  return apiFetch(`/api/admin/regions/${regionId}`, {
    method: "GET",
  });
}

/**
 * Update a region (admin)
 * @param {number} regionId - Region ID
 * @param {Object} data - Updated region data
 * @returns {Promise<Object>} - API response with updated region
 */
export async function updateRegion(regionId, data) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/regions/${regionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a region (admin)
 * @param {number} regionId - Region ID
 * @returns {Promise<Object>} - API response
 */
export async function deleteRegion(regionId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/regions/${regionId}`, {
    method: "DELETE",
  });
}

/**
 * Toggle region active status (admin)
 * @param {number} regionId - Region ID
 * @returns {Promise<Object>} - API response with updated region
 */
export async function toggleRegionStatus(regionId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/regions/${regionId}/toggle-status`, {
    method: "POST",
  });
}

/**
 * Get all cities with pagination, search, and region filter (admin)
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} search - Search term
 * @param {number} regionId - Optional region filter
 * @returns {Promise<Object>} - API response with cities and pagination
 */
export async function listCities(page = 1, perPage = 15, search = "", regionId = null) {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (perPage) params.append("per_page", perPage);
  if (search) params.append("search", search);
  if (regionId) params.append("region_id", regionId);

  return apiFetch(`/api/admin/cities?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Create a new city (admin)
 * @param {Object} data - City data {region_id, name_en, name_am, is_active}
 * @returns {Promise<Object>} - API response with created city
 */
export async function createCity(data) {
  await ensureCsrfCookie();
  return apiFetch("/api/admin/cities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Get a specific city (admin)
 * @param {number} cityId - City ID
 * @returns {Promise<Object>} - API response with city data
 */
export async function getCity(cityId) {
  return apiFetch(`/api/admin/cities/${cityId}`, {
    method: "GET",
  });
}

/**
 * Update a city (admin)
 * @param {number} cityId - City ID
 * @param {Object} data - Updated city data
 * @returns {Promise<Object>} - API response with updated city
 */
export async function updateCity(cityId, data) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/cities/${cityId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a city (admin)
 * @param {number} cityId - City ID
 * @returns {Promise<Object>} - API response
 */
export async function deleteCity(cityId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/cities/${cityId}`, {
    method: "DELETE",
  });
}

/**
 * Toggle city active status (admin)
 * @param {number} cityId - City ID
 * @returns {Promise<Object>} - API response with updated city
 */
export async function toggleCityStatus(cityId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/cities/${cityId}/toggle-status`, {
    method: "POST",
  });
}

export default {
  // Public
  getActiveRegions,
  getCitiesByRegion,
  // Admin
  listRegions,
  createRegion,
  getRegion,
  updateRegion,
  deleteRegion,
  toggleRegionStatus,
  listCities,
  createCity,
  getCity,
  updateCity,
  deleteCity,
  toggleCityStatus,
};
