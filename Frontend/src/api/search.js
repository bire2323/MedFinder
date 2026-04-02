const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

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
    departments: Array.isArray(f?.departments) ? f.departments : [],
    services: Array.isArray(f?.services) ? f.services : [],
  };
}

export async function apiFetchFacilities({ signal } = {}) {
  const res = await fetch(`${API_BASE}/medical-facilities`, {
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
  // Mocking the drug search endpoint
  // In a real app: const res = await fetch(`${API_BASE}/medicines/search?query=${medicineName}`, { ... });

  // For now, let's fetch all pharmacies and simulate a drug result
  const facilities = await apiFetchFacilities({ signal });
  const pharmacies = facilities.filter(f => f.type === 'pharmacy');

  // Randomly add drug info to some pharmacies for demonstration
  return pharmacies.map(p => ({
    ...p,
    drugPrice: (Math.random() * 500 + 50).toFixed(2), // Random price
    drugAvailability: Math.random() > 0.3 ? 'available' : 'not_available'
  }));
}

