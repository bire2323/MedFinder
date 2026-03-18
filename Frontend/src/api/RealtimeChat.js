import { apiFetch, ensureCsrfCookie } from "./client";

export default async function apiStartChatSession(payload) {
  await ensureCsrfCookie();
  return apiFetch("/api/chat/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}