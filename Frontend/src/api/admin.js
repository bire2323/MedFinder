import { apiFetch, ensureCsrfCookie } from "./client";

export async function getAllUsers(_token, params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/admin/users${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function updateUser(_token, userId, payload) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getPendingApprovals(_token) {
  return apiFetch("/api/admin/approvals", { method: "GET" });
}

export async function decideApproval(_token, approvalId, decision, reason) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/approvals/${approvalId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, reason }),
  });
}

export async function getSystemStats(_token) {
  return apiFetch("/api/admin/stats", { method: "GET" });
}

export async function getActivityFeed(_token, params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/admin/activity${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function getNotifications(_token) {
  return apiFetch("/api/admin/notifications", { method: "GET" });
}

export async function markNotificationRead(_token, notificationId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/notifications/${notificationId}/read`, { method: "POST" });
}

export async function logAdminEvent(_token, payload) {
  await ensureCsrfCookie();
  return apiFetch("/api/admin/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function AllAuditLog(
  pagenumber = 1,
  searchTerm = "",
  activeCategory = "ALL",
  startDate,
  endDate
) {
  const qs = new URLSearchParams({
    page: String(pagenumber),
    search: searchTerm || "",
    category: activeCategory || "ALL",
    start_date: startDate || "",
    end_date: endDate || "",
  }).toString();

  return apiFetch(`/api/auditlogs?${qs}`, { method: "GET" });
}

