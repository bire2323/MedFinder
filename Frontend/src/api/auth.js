import { apiFetch, ensureCsrfCookie } from "./client";

export async function apiRegister(formData) {
  return apiFetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}

export async function apiLogin(formData) {

  await ensureCsrfCookie();
  return apiFetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}
export async function apiOtpVerify(formData) {
  console.log("apiotpveerify", formData);
  await ensureCsrfCookie();
  return apiFetch("/api/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}
export async function apiOtpResend(formData) {
  await ensureCsrfCookie();
  return apiFetch("/api/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}
export async function apiForgotPassword(formData) {
  await ensureCsrfCookie();
  return apiFetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}
export async function apiResetPassword(formData) {
  await ensureCsrfCookie();
  return apiFetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}
export async function apiUserResetPasswordVerifyOtp(formData) {
  await ensureCsrfCookie();
  return apiFetch("/api/user-reset-password/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
}
export async function apiLogout() {
  await ensureCsrfCookie();
  return apiFetch("/api/logout", { method: "POST" });
}

export async function apiMe() {
  await ensureCsrfCookie();
  return apiFetch("/api/user", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  apiRegister,
  apiLogin,
  apiLogout,
  apiMe,
  apiOtpVerify,
  apiOtpResend,
  apiForgotPassword,
  apiResetPassword,
  apiUserResetPasswordVerifyOtp,
};
