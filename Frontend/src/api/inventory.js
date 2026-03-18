/**
 * API functions for pharmacy inventory management
 */
import { apiFetch, ensureCsrfCookie } from "./client";

/**
 * Get all drugs in pharmacy inventory
 * @returns {Promise<Object>} - API response with inventory list
 */
export async function apiGetInventory() {
  return apiFetch("/api/pharmacy/inventory", { method: "GET" });
}

export async function apiGetDrug(id) {
  return apiFetch(`/api/pharmacy/inventory/${id}`, { method: "GET" });
}

/**
 * Add a new drug to inventory
 * @param {Object} drugData - The drug data to add
 * @returns {Promise<Object>} - API response
 */
export async function apiAddDrug(drugData) {
  await ensureCsrfCookie();
  return apiFetch("/api/pharmacy/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(drugData),
  });
}

/**
 * Update an existing drug in inventory
 * @param {number} drugId - The drug ID to update
 * @param {Object} drugData - The updated drug data
 * @returns {Promise<Object>} - API response
 */
export async function apiUpdateDrug(drugId, drugData) {
  await ensureCsrfCookie();
  return apiFetch(`/api/pharmacy/inventory/${drugId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(drugData),
  });
}

/**
 * Delete a drug from inventory
 * @param {number} drugId - The drug ID to delete
 * @returns {Promise<Object>} - API response
 */
export async function apiDeleteDrug(drugId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/pharmacy/inventory/${drugId}`, { method: "DELETE" });
}

/**
 * Search drugs in inventory
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response with filtered inventory
 */
export async function apiSearchDrugs(query) {
  return apiFetch(`/api/pharmacy/inventory/search?q=${encodeURIComponent(query)}`, { method: "GET" });
}

export default {
  apiGetInventory,
  apiAddDrug,
  apiUpdateDrug,
  apiDeleteDrug,
  apiSearchDrugs
};
