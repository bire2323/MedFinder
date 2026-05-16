import { apiFetch, ensureCsrfCookie } from "./client";

// Hospital Management
export async function getHospitalDetails() {
  return apiFetch("/api/hospital", { method: "GET" });
}

// presidence: unused API (temporarily disabled, do not delete)
// export async function createOrUpdateHospital(token, payload) {
//   await ensureCsrfCookie();
//   return apiFetch("/api/hospital", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
// }

// presidence: unused API (temporarily disabled, do not delete)
// export async function deleteHospital(token, hospitalId) {
//   await ensureCsrfCookie();
//   return apiFetch(`/api/hospital/${hospitalId}`, { method: "DELETE" });
// }

// Department & Service Management
// presidence: unused API (temporarily disabled, do not delete)
// export async function getDepartments(token, hospitalId) {
//   return apiFetch(`/api/hospitals/${hospitalId}/departments`, { method: "GET" });
// }

// presidence: unused API (temporarily disabled, do not delete)
// export async function saveDepartment(token, hospitalId, department) {
//   const method = department.id ? 'PUT' : 'POST';
//   const url = department.id
//     ? `/api/hospitals/${hospitalId}/departments/${department.id}`
//     : `/api/hospitals/${hospitalId}/departments`;
// 
//   await ensureCsrfCookie();
//   return apiFetch(url, {
//     method,
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(department),
//   });
// }

// presidence: unused API (temporarily disabled, do not delete)
// export async function deleteDepartment(token, hospitalId, departmentId) {
//   await ensureCsrfCookie();
//   return apiFetch(`/api/hospitals/${hospitalId}/departments/${departmentId}`, { method: "DELETE" });
// }

// Profile Management
// presidence: unused API (temporarily disabled, do not delete)
// export async function getAgentProfile(token) {
//   return apiFetch("/api/hospital-agent/profile", { method: "GET" });
// }

// presidence: unused API (temporarily disabled, do not delete)
// export async function updateAgentProfile(token, payload) {
//   await ensureCsrfCookie();
//   return apiFetch("/api/hospital-agent/profile", {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
// }

// presidence: unused API (temporarily disabled, do not delete)
// export async function getVerificationStatus(token) {
//   return apiFetch("/api/hospital-agent/verification-status", { method: "GET" });
// }

// Logging
// presidence: unused API (temporarily disabled, do not delete)
// export async function logHospitalEvent(token, payload) {
//   await ensureCsrfCookie();
//   return apiFetch("/api/hospital-agent/logs", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
// }

/**
 * API functions for hospital dashboard management (departments & services)
 */

const API_BASE_Local = "https://medfinder.com";

/**
 * Get auth token from localStorage
 */
export async function apiGetTopFacilities() {
  const res = await apiFetch("https://medfinder.com/api/top-medical-facilities", { method: "GET" });
  // keep backward-compat shape expected by router loader
  return res;
}
export async function apiGetFacilities() {
  console.log("apiGetFacilities response");
  const res = await apiFetch("https://medfinder.com/api/medical-facilities", { method: "GET" });
  // keep backward-compat shape expected by router loader
  return { ok: true, json: async () => res };
}
// presidence: unused API (temporarily disabled, do not delete)
// export async function apiGetHospitals() {
//   const res = await apiFetch("https://medfinder.com/api/hospitals", { method: "GET" });
//   return { ok: true, json: async () => res };
// }

// presidence: unused API (temporarily disabled, do not delete)
// export async function apiGetPharmacies() {
//   return apiFetch("/api/pharmacies", { method: "GET" });
// }

export async function apiGetPharmacyProfile() {
  return apiFetch("/api/pharmacy-agent/profile", { method: "GET" });
}


// ==================== DEPARTMENTS ====================

/**
 * Get all departments for the hospital
 * @returns {Promise<Object>} - API response with departments list
 */
export async function apiGetDepartments() {
  return apiFetch("/api/hospital/departments", { method: "GET" });
}

/**
 * Add a new department
 * @param {Object} departmentData - The department data to add
 * @returns {Promise<Object>} - API response
 */
export async function apiAddDepartment(departmentData) {
  await ensureCsrfCookie();
  return apiFetch("/api/hospital/departments", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(departmentData),
  });
}

/**
 * Update an existing department
 * @param {number} departmentId - The department ID to update
 * @param {Object} departmentData - The updated department data
 * @returns {Promise<Object>} - API response
 */
export async function apiUpdateDepartment(departmentId, departmentData) {
  await ensureCsrfCookie();
  return apiFetch(`/api/hospital/departments/${departmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(departmentData),
  });
}

/**
 * Delete a department
 * @param {number} departmentId - The department ID to delete
 * @returns {Promise<Object>} - API response
 */
export async function apiDeleteDepartment(departmentId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/hospital/departments/${departmentId}`, { method: "DELETE" });
}

// ==================== SERVICES ====================

/**
 * Get all services for the hospital
 * @returns {Promise<Object>} - API response with services list
 */
export async function apiGetServices() {
  return apiFetch("/api/hospital/services", { method: "GET" });
}

/**
 * Add a new service
 * @param {Object} serviceData - The service data to add
 * @returns {Promise<Object>} - API response
 */
export async function apiAddService(serviceData) {
  await ensureCsrfCookie();
  return apiFetch("/api/hospital/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serviceData),
  });
}

/**
 * Update an existing service
 * @param {number} serviceId - The service ID to update
 * @param {Object} serviceData - The updated service data
 * @returns {Promise<Object>} - API response
 */
export async function apiUpdateService(serviceId, serviceData) {
  await ensureCsrfCookie();
  return apiFetch(`/api/hospital/services/${serviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serviceData),
  });
}

/**
 * Delete a service
 * @param {number} serviceId - The service ID to delete
 * @returns {Promise<Object>} - API response
 */
export async function apiDeleteService(serviceId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/hospital/services/${serviceId}`, { method: "DELETE" });
}

/**
 * Search departments
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response with filtered departments
 */
// presidence: unused API (temporarily disabled, do not delete)
// export async function apiSearchDepartments(query) {
//   return apiFetch(`/api/hospital/departments/search?q=${encodeURIComponent(query)}`, { method: "GET" });
// }

/**
 * Search services
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response with filtered services
 */
// presidence: unused API (temporarily disabled, do not delete)
// export async function apiSearchServices(query) {
//   return apiFetch(`/api/hospital/services/search?q=${encodeURIComponent(query)}`, { method: "GET" });
// }

export default {

  apiGetDepartments,
  apiAddDepartment,
  apiUpdateDepartment,
  apiDeleteDepartment,
  apiGetServices,
  apiAddService,
  apiUpdateService,
  apiDeleteService,
  // presidence: unused API (temporarily disabled, do not delete)
  // apiSearchDepartments,
  // presidence: unused API (temporarily disabled, do not delete)
  // apiSearchServices,
  // presidence: unused API (temporarily disabled, do not delete)
  // apiGetHospitals,
  // presidence: unused API (temporarily disabled, do not delete)
  // apiGetPharmacies
};
