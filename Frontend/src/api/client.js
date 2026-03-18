const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [k, ...rest] = c.split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export function getXsrfToken() {
  // Laravel sets XSRF-TOKEN cookie (NOT httpOnly) for SPA clients.
  const raw = getCookie("XSRF-TOKEN");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function ensureCsrfCookie() {
  await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // For state-changing requests, include XSRF header when available.
  const method = (options.method || "GET").toUpperCase();
  const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (needsCsrf) {
    const xsrf = getXsrfToken();
    if (xsrf && !headers["X-XSRF-TOKEN"]) {
      headers["X-XSRF-TOKEN"] = xsrf;
    }
  }

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");
  console.log('bodyresponse', body);
  if (!res.ok) {
    const msg = (body && body.message) || (typeof body === "string" ? body : "") || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

