import { apiFetch, ensureCsrfCookie } from "./client";

export async function fetchMessages(sessionId) {
  const data = await apiFetch(`/api/chat/sessions/${sessionId}/messages`, { method: "GET" });
  const arr = Array.isArray(data) ? data : Object.values(data || {});
  return arr;
}

export async function sendMessage(sessionId, message) {
  await ensureCsrfCookie();
  return apiFetch(`/api/chat/sessions/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export async function markMessagesRead(sessionId, messageId = null) {
  await ensureCsrfCookie();
  return apiFetch(`/api/chat/sessions/${sessionId}/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message_id: messageId }),
  });
}
