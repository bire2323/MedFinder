const API_BASE = import.meta.env.VITE_API_BASE || "https://medfinder.com";

function safeFloat(v) {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

/** Core facility fields aligned with normalizeFacility from search.js */
export function normalizeHospitalCapability(h) {
  const mainAddress = Array.isArray(h?.addresses) && h.addresses.length > 0 ? h.addresses[0] : null;

  const lat = safeFloat(mainAddress?.latitude ?? h?.lat);
  const lng = safeFloat(mainAddress?.longitude ?? h?.lng);

  const deptList = Array.isArray(h.departments) ? h.departments : [];
  const linkedServices = Array.isArray(h.services)
    ? h.services.map((fs) => fs.service).filter(Boolean)
    : [];

  const rating = safeFloat(h?.rating);

  return {
    raw: h,
    id: h?.id,
    type: "hospital",
    name:
      h?.hospital_name_en ||
      h?.name ||
      "Hospital",
    address:
      h?.address_description_en ||
      mainAddress?.address_description_en ||
      mainAddress?.street_en ||
      mainAddress?.sub_city_en ||
      mainAddress?.city_en ||
      "",
    lat,
    lng,
    rating,
    isFullTime: h?.is_full_time_service === 1 || h?.is_full_time_service === true,
    departments: deptList,
    services: linkedServices,
    hospital_name_en: h?.hospital_name_en,
    hospital_name_am: h?.hospital_name_am,
    pharmacy_name_en: undefined,
    pharmacy_name_am: undefined,
    addresses: h?.addresses,
    address_description_en: h?.address_description_en,
    address_description_am: h?.address_description_am,
    working_hour: h?.working_hour,
  };
}

async function parseJson(res) {
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : {};
  } catch {
    throw new Error(txt || `Invalid JSON (${res.status})`);
  }
}

export async function apiFetchHospitalCapabilities({ signal } = {}) {
  const res = await fetch(`${API_BASE}/api/public/hospitals/capabilities`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Failed to load hospitals (${res.status})`);
  }
  const data = await parseJson(res);
  const rows = data.data ?? [];
  return rows.map(normalizeHospitalCapability);
}

export async function apiFetchPublicDepartments({ signal } = {}) {
  const res = await fetch(`${API_BASE}/api/public/departments`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to load departments (${res.status})`);
  }
  const data = await parseJson(res);
  return data.data ?? [];
}

export async function apiFetchPublicServices({ signal } = {}) {
  const res = await fetch(`${API_BASE}/api/public/services`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to load services (${res.status})`);
  }
  const data = await parseJson(res);
  return data.data ?? [];
}
