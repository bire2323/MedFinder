import { apiFetch, ensureCsrfCookie } from "./client";

export async function getAllUsers(_token, params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/admin/users${query ? `?${query}` : ""}`, { method: "GET" });
}
export async function getUsers(page) {
  return apiFetch(`/api/admin/all/users?page=${page}`);

}

export async function updateUser(_token, userId, payload) {
  console.log(payload);
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getPendingApprovals(user, status = 'PENDING') {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/approvals?status=${status}`, { method: "GET" });
}

export async function decideApproval(user, approvalId, decision, reason, type) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/approvals/${approvalId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, reason, type }),
  });
}

export async function getSystemStats(user) {
  return apiFetch("/api/admin/stats", { method: "GET" });
}

export async function getAnalytics(range = '7d') {
  return apiFetch(`/api/admin/analytics?range=${range}`, { method: "GET" });
}
// presidence: unused API (temporarily disabled, do not delete)
// export async function getActivityFeed(user, params = {}) {
//   const query = new URLSearchParams(params).toString();
//   return apiFetch(`/api/admin/activity${query ? `?${query}` : ""}`, { method: "GET" });
// }

export async function getNotifications(user) {
  return apiFetch("/api/admin/notifications", { method: "GET" });
}

export async function markNotificationRead(user, notificationId) {
  await ensureCsrfCookie();
  return apiFetch(`/api/admin/notifications/${notificationId}/read`, { method: "POST" });
}

// presidence: unused API (temporarily disabled, do not delete)
// export async function logAdminEvent(user, payload) {
//   await ensureCsrfCookie();
//   return apiFetch("/api/admin/logs", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
// }

// presidence: unused API (temporarily disabled, do not delete)
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

  return apiFetch(`/api/admin/audit-logs?${qs}`, { method: "GET" });
}

