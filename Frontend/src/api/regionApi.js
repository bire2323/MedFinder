import axiosInstance from "./axios";

function unwrap(res) {
  return res?.data?.data ?? res?.data;
}

export async function getRegions() {
  const res = await axiosInstance.get("/api/regions");
  return unwrap(res);
}

export async function getAdminRegions(params = {}) {
  const res = await axiosInstance.get("/api/admin/regions", { params });
  return res.data;
}

export async function createRegion(payload) {
  const res = await axiosInstance.post("/api/admin/regions", payload);
  return res.data;
}

export async function updateRegion(id, payload) {
  const res = await axiosInstance.put(`/api/admin/regions/${id}`, payload);
  return res.data;
}

export async function deleteRegion(id) {
  const res = await axiosInstance.delete(`/api/admin/regions/${id}`);
  return res.data;
}

export async function toggleRegionStatus(id) {
  const res = await axiosInstance.post(`/api/admin/regions/${id}/toggle-status`);
  return res.data;
}

export default {
  getRegions,
  getAdminRegions,
  createRegion,
  updateRegion,
  deleteRegion,
  toggleRegionStatus,
};

