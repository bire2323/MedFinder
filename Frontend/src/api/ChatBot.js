import { detectLanguage } from "../hooks/DetectLanguage";
import { apiFetch, ensureCsrfCookie } from "./client";

async function sendMessage(text) {
  // await ensureCsrfCookie();
  //  return apiFetch("/api/detectIntent", {
  //    method: "POST",
  //   headers: { "Content-Type": "application/json" },
  // body: JSON.stringify({ question: text }),
  // });
  const res = await fetch('https://medfinder.com/webhooks/rest/webhook', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: "patient_001", message: text, entities: [
        {
          entity: "language",
          value: detectLanguage(text)
        }
      ]
    }),
  })
  return res.json();

}

export const getTriage = async (symptoms) => {
  await ensureCsrfCookie();
  const res = await apiFetch("/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms }),
  });
  return res?.response ?? res;
};

export const uploadPrescription = async (file) => {
  await ensureCsrfCookie();
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/ai/prescription", {
    method: "POST",
    body: formData,
  });
};

export async function apiSendMessage(sessionId, message) {
  await ensureCsrfCookie();
  // backend expects JSON: { message: string }
  return apiFetch(`/api/chat/sessions/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export { sendMessage };