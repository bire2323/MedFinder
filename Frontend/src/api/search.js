const API_BASE = import.meta.env.VITE_API_BASE || "";

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

  // Address fields vary by endpoint:
  // - Some responses include addresses[0].region.name_en + addresses[0].city.name_en + addresses[0].description_en
  // - Some legacy responses include addresses[0].region_en/sub_city_en
  const addrDescEn =
    f?.address_description_en ||
    mainAddress?.address_description_en ||
    mainAddress?.description_en ||
    "";

  const addrDescAm =
    f?.address_description_am ||
    mainAddress?.address_description_am ||
    mainAddress?.description_am ||
    "";

  const cityEn =
    mainAddress?.city?.name_en ||
    mainAddress?.city_en ||
    mainAddress?.sub_city_en ||
    "";
  const regionEn =
    mainAddress?.region?.name_en ||
    mainAddress?.region_en ||
    "";

  const kebele = mainAddress?.kebele || "";

  // Used for search filtering + quick preview (English-ish)
  // Keep cards clean: "City, Region" only
  const address = [cityEn, regionEn].filter(Boolean).join(", ");

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

    // For ResultCard address rendering
    addresses: f?.addresses,
    address_description_en: addrDescEn,
    address_description_am: addrDescAm,
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
  const res = await fetch(`${API_BASE}/api/pharmacy/inventory/medicines/search?query=${encodeURIComponent(medicineName)}`, {
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
    const normalized = normalizeFacility(item);
    const drugName = item.drugName || item.drug_name || item.brand_name_en || item.generic_name || item.name;

    return {
      ...normalized,
      drugPrice: item.drugPrice ?? item.drug_price ?? item.price,
      expire_date: item.expire_date,
      drugAvailability: item.drugAvailability ?? item.drug_availability,
      drugName,
    };
  });
}

