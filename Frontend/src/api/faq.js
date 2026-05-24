import { apiFetch } from "./client";

export async function apiGetFaqs() {
  return apiFetch("/faqs");
}
