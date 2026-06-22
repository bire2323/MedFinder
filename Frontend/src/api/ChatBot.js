import { detectLanguage } from "../hooks/DetectLanguage";
import { apiFetch, ensureCsrfCookie } from "./client";

const baseUrl = import.meta.env.VITE_fast_API_BASE || "";

async function sendMessage(text, lat, lng) {
  const res = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, lat, lng }),
  });
  return res.json();
}

// presidence: unused API (temporarily disabled, do not delete)
// export const getTriage = async (symptoms) => {
//   await ensureCsrfCookie();
//   const res = await apiFetch("/api/ai/triage", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ symptoms }),
//   });
//   return res?.response ?? res;
// };

export const uploadPrescription = async (file) => {
  await ensureCsrfCookie();
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/ai/prescription", {
    method: "POST",
    body: formData,
  });
};

// presidence: unused API (temporarily disabled, do not delete)
// export async function apiSendMessage(sessionId, message) {
//   await ensureCsrfCookie();
//   // backend expects JSON: { message: string }
//   return apiFetch(`/api/chat/sessions/${sessionId}/message`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message }),
//   });
// }

export { sendMessage };