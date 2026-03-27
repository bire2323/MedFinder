import { apiFetch, ensureCsrfCookie } from "./client";

export async function apiProfileUpdate(profileData) {
    await ensureCsrfCookie();
    return apiFetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
    });
}

export async function apiPasswordUpdate(formData) {

    await ensureCsrfCookie();
    return apiFetch("/api/profile/password-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });
}
