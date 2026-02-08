import useAuthStore from "../store/UserAuthStore";


const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_BASE_Local = "http://localhost:8000/api";




export async function apiRegister(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/register`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}

export async function apiLogin(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/login`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}
export async function apiOtpVerify(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/verify-otp`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}
export async function apiOtpResend(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/resend-otp`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}
export async function apiForgotPassword(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/forgot-password`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}
export async function apiResetPassword(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/reset-password`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}
export async function apiUserResetPasswordVerifyOtp(formData) {
  console.log(formData);
  const res = await fetch(`${API_BASE_Local}/user-reset-password/verify-otp`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}
export async function apiLogout() {
  const token = useAuthStore.getState().token;

  if (!token) {
    console.warn("Logout called without token");
    return { success: false };
  }

  const res = await fetch(`${API_BASE_Local}/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // ✅ Safely handle empty response
  if (res.status === 204) {
    return null;
  }

  return res.json();
}


export default { apiRegister, apiLogin, apiLogout, apiOtpVerify, apiOtpResend, apiForgotPassword, apiResetPassword };
