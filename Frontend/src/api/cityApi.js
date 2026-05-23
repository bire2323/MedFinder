import axiosInstance from "./axios";

function unwrap(res) {
  return res?.data?.data ?? res?.data;
}

export async function getCitiesByRegion(regionId) {
  if (!regionId) return [];
  const res = await axiosInstance.get(`/api/regions/${regionId}/cities`);
  return unwrap(res);
}

export async function getAdminCities(params = {}) {
  const res = await axiosInstance.get("/api/admin/cities", { params });
  return res.data;
}

export async function createCity(payload) {
  const res = await axiosInstance.post("/api/admin/cities", payload);
  return res.data;
}

export async function updateCity(id, payload) {
  const res = await axiosInstance.put(`/api/admin/cities/${id}`, payload);
  return res.data;
}

export async function deleteCity(id) {
  const res = await axiosInstance.delete(`/api/admin/cities/${id}`);
  return res.data;
}

export async function toggleCityStatus(id) {
  const res = await axiosInstance.post(`/api/admin/cities/${id}/toggle-status`);
  return res.data;
}

export default {
  getCitiesByRegion,
  getAdminCities,
  createCity,
  updateCity,
  deleteCity,
  toggleCityStatus,
};

