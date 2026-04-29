const API_BASE = import.meta.env.VITE_API_BASE || "https://medfinder.com";

function safeFloat(v) {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function normalizeFacility(f) {
  const typeRaw = (f?.type || "").toString().toLowerCase();
  const type = typeRaw === "hospital" ? "hospital" : typeRaw === "pharmacy" ? "pharmacy" : typeRaw;
  const mainAddress = Array.isArray(f?.addresses) && f.addresses.length > 0 ? f.addresses[0] : null;

  const name =
    f?.hospital_name_en ||
    f?.pharmacy_name_en ||
    f?.name ||
    (type === "hospital" ? "Hospital" : type === "pharmacy" ? "Pharmacy" : "Facility");

  const address =
    f?.address_description_en ||
    mainAddress?.address_description_en ||
    mainAddress?.street_en ||
    mainAddress?.sub_city_en ||
    mainAddress?.city_en ||
    "";

  const lat = safeFloat(mainAddress?.latitude ?? f?.lat);
  const lng = safeFloat(mainAddress?.longitude ?? f?.lng);

  const rating = safeFloat(f?.rating);
  const isFullTime = f?.is_full_time_service === 1 || f?.is_full_time_service === true;

  return {
    raw: f,
    id: f?.id,
    type,
    name,
    address,
    lat,
    lng,
    rating,
    isFullTime,
    workingHour: f?.working_hour,
    departments: Array.isArray(f?.departments) ? f.departments : [],
    services: Array.isArray(f?.services) ? f.services : [],
  };
}

export async function apiFetchFacilities({ signal } = {}) {
  const res = await fetch(`${API_BASE}/api/medical-facilities`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to load facilities (${res.status})`);
  }
  const data = await res.json();
  return data.data?.map(normalizeFacility);
}

export async function apiFetchDrugResults(medicineName, { signal } = {}) {
  const res = await fetch(`${API_BASE}/api/pharmacy/inventory/medicines/search?query=${medicineName}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to load drug results (${res.status})`);
  }

  const data = await res.json();
  return data.map(item => {
    // Normalize the pharmacy facility object so that lat, lng, name, address, etc. exist
    const normalized = normalizeFacility(item);

    return {
      ...normalized,
      drugPrice: item.drugPrice,
      expire_date: item.expire_date,
      drugAvailability: item.drugAvailability,
      drugName: item.drugName
    };
  });
}

