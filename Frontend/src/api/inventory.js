/**
 * API functions for pharmacy inventory management
 */
import { apiFetch, ensureCsrfCookie } from "./client";

/**
 * Get all drugs in pharmacy inventory with filtering and pagination
 * @param {Object} params - Search, category, status, per_page
 */
export async function apiGetInventory(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/pharmacy/inventory${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function apiGetDrug(id) {
  return apiFetch(`/api/pharmacy/inventory/${id}`, { method: "GET" });
}

export async function apiGetAnalytics() {
  return apiFetch("/api/pharmacy/inventory/analytics", { method: "GET" });
}

export async function apiGetTrash() {
  return apiFetch("/api/pharmacy/inventory/trash", { method: "GET" });
}

export async function apiRestoreDrug(id) {
  await ensureCsrfCookie();
  return apiFetch(`/api/pharmacy/inventory/${id}/restore`, { method: "POST" });
}

export async function apiToggleAvailability(id) {
  await ensureCsrfCookie();
  return apiFetch(`/api/pharmacy/inventory/${id}/toggle-availability`, { method: "PATCH" });
}

/**
 * Add a new drug to inventory
 * @param {Object} drugData - The drug data to add
 */
export async function apiAddDrug(drugData) {
  console.log(drugData);
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
 */
export async function apiDeleteDrug(drugId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/pharmacy/inventory/${drugId}`, { method: "DELETE" });
}

/**
 * Search drugs in inventory
 * @param {string} query - Search query
 */
export async function apiSearchDrugs(query) {
  return apiGetInventory({ search: query });
}

export async function apiGetStockHistory(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiFetch(`/api/pharmacy/inventory/history`, { method: "GET" });
}
//${query ? `?${query}` : ""}

export default {
  apiGetInventory,
  apiGetAnalytics,
  apiGetTrash,
  apiGetStockHistory,
  apiRestoreDrug,
  apiToggleAvailability,
  apiAddDrug,
  apiUpdateDrug,
  apiDeleteDrug,
  apiSearchDrugs
};
