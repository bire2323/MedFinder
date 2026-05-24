import { apiFetch } from "./client";

export async function apiGetFaqs(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/api/faqs${query}`);
}

export async function apiGetAdminFaqs(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/api/admin/faqs${query}`);
}

export async function apiCreateFaq(payload) {
  return apiFetch(`/api/admin/faqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateFaq(id, payload) {
  return apiFetch(`/api/admin/faqs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteFaq(id) {
  return apiFetch(`/admin/faqs/${id}`, {
    method: "DELETE",
  });
}
