import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [k, ...rest] = c.split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

function getXsrfToken() {
  const raw = getCookie("XSRF-TOKEN");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function toApiError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const message =
    data?.message ||
    (typeof data === "string" ? data : "") ||
    error?.message ||
    "Request failed";

  const apiError = new Error(message);
  apiError.status = status;
  apiError.data = data;
  apiError.validation = data?.errors || null;
  return apiError;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let csrfReadyPromise = null;
function ensureCsrfCookie() {
  if (csrfReadyPromise) return csrfReadyPromise;
  csrfReadyPromise = axiosInstance
    .get("/sanctum/csrf-cookie")
    .then(() => true)
    .catch((e) => {
      csrfReadyPromise = null;
      throw e;
    });
  return csrfReadyPromise;
}

axiosInstance.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toUpperCase();
  const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (needsCsrf) {
    await ensureCsrfCookie();
    const xsrf = getXsrfToken();
    if (xsrf && !config.headers?.["X-XSRF-TOKEN"]) {
      config.headers = { ...(config.headers || {}), "X-XSRF-TOKEN": xsrf };
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(toApiError(error))
);

export default axiosInstance;
