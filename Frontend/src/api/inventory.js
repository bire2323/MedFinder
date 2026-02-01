/**
 * API functions for pharmacy inventory management
 */

const API_BASE_Local = "http://localhost:8000/api";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => localStorage.getItem('token');

/**
 * Get all drugs in pharmacy inventory
 * @returns {Promise<Object>} - API response with inventory list
 */
export async function apiGetInventory() {
  const res = await fetch(`${API_BASE_Local}/pharmacy/inventory`, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  return res.json();
}

/**
 * Add a new drug to inventory
 * @param {Object} drugData - The drug data to add
 * @returns {Promise<Object>} - API response
 */
export async function apiAddDrug(drugData) {
  const res = await fetch(`${API_BASE_Local}/pharmacy/inventory`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(drugData),
  });
  return res.json();
}

/**
 * Update an existing drug in inventory
 * @param {number} drugId - The drug ID to update
 * @param {Object} drugData - The updated drug data
 * @returns {Promise<Object>} - API response
 */
export async function apiUpdateDrug(drugId, drugData) {
  const res = await fetch(`${API_BASE_Local}/pharmacy/inventory/${drugId}`, {
    method: "PUT",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(drugData),
  });
  return res.json();
}

/**
 * Delete a drug from inventory
 * @param {number} drugId - The drug ID to delete
 * @returns {Promise<Object>} - API response
 */
export async function apiDeleteDrug(drugId) {
  const res = await fetch(`${API_BASE_Local}/pharmacy/inventory/${drugId}`, {
    method: "DELETE",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  return res.json();
}

/**
 * Search drugs in inventory
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response with filtered inventory
 */
export async function apiSearchDrugs(query) {
  const res = await fetch(`${API_BASE_Local}/pharmacy/inventory/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  return res.json();
}

export default { 
  apiGetInventory, 
  apiAddDrug, 
  apiUpdateDrug, 
  apiDeleteDrug, 
  apiSearchDrugs 
};
