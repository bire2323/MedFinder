/**
 * API functions for hospital dashboard management (departments & services)
 */

const API_BASE_Local = "http://localhost:8000/api";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => localStorage.getItem('token');


export async function apiGetHospitals() {
  const res = await fetch(`${API_BASE_Local}/hospitals`, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
    },
  });
  return res.json();
}

export async function apiGetPharmacies() {
  const res = await fetch(`${API_BASE_Local}/pharmacies`, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
    },
  });
  return res.json();
}


// ==================== DEPARTMENTS ====================

/**
 * Get all departments for the hospital
 * @returns {Promise<Object>} - API response with departments list
 */
export async function apiGetDepartments() {
  const res = await fetch(`${API_BASE_Local}/hospital/departments`, {
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
 * Add a new department
 * @param {Object} departmentData - The department data to add
 * @returns {Promise<Object>} - API response
 */
export async function apiAddDepartment(departmentData) {
  const res = await fetch(`${API_BASE_Local}/hospital/departments`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(departmentData),
  });
  return res.json();
}

/**
 * Update an existing department
 * @param {number} departmentId - The department ID to update
 * @param {Object} departmentData - The updated department data
 * @returns {Promise<Object>} - API response
 */
export async function apiUpdateDepartment(departmentId, departmentData) {
  const res = await fetch(`${API_BASE_Local}/hospital/departments/${departmentId}`, {
    method: "PUT",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(departmentData),
  });
  return res.json();
}

/**
 * Delete a department
 * @param {number} departmentId - The department ID to delete
 * @returns {Promise<Object>} - API response
 */
export async function apiDeleteDepartment(departmentId) {
  const res = await fetch(`${API_BASE_Local}/hospital/departments/${departmentId}`, {
    method: "DELETE",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  return res.json();
}

// ==================== SERVICES ====================

/**
 * Get all services for the hospital
 * @returns {Promise<Object>} - API response with services list
 */
export async function apiGetServices() {
  const res = await fetch(`${API_BASE_Local}/hospital/services`, {
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
 * Add a new service
 * @param {Object} serviceData - The service data to add
 * @returns {Promise<Object>} - API response
 */
export async function apiAddService(serviceData) {
  const res = await fetch(`${API_BASE_Local}/hospital/services`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(serviceData),
  });
  return res.json();
}

/**
 * Update an existing service
 * @param {number} serviceId - The service ID to update
 * @param {Object} serviceData - The updated service data
 * @returns {Promise<Object>} - API response
 */
export async function apiUpdateService(serviceId, serviceData) {
  const res = await fetch(`${API_BASE_Local}/hospital/services/${serviceId}`, {
    method: "PUT",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(serviceData),
  });
  return res.json();
}

/**
 * Delete a service
 * @param {number} serviceId - The service ID to delete
 * @returns {Promise<Object>} - API response
 */
export async function apiDeleteService(serviceId) {
  const res = await fetch(`${API_BASE_Local}/hospital/services/${serviceId}`, {
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
 * Search departments
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response with filtered departments
 */
export async function apiSearchDepartments(query) {
  const res = await fetch(`${API_BASE_Local}/hospital/departments/search?q=${encodeURIComponent(query)}`, {
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
 * Search services
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response with filtered services
 */
export async function apiSearchServices(query) {
  const res = await fetch(`${API_BASE_Local}/hospital/services/search?q=${encodeURIComponent(query)}`, {
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
  
  apiGetDepartments, 
  apiAddDepartment, 
  apiUpdateDepartment, 
  apiDeleteDepartment,
  apiGetServices,
  apiAddService,
  apiUpdateService,
  apiDeleteService,
  apiSearchDepartments,
  apiSearchServices,
  apiGetHospitals,
  apiGetPharmacies
};
