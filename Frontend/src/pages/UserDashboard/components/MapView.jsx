import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";

import { apiFetchFacilities } from "../../../api/search";
import { uploadPrescription } from "../../../api/ChatBot";
import { apiFetch, ensureCsrfCookie } from "../../../api/client";
import getDistanceFromLatLonInMeters from "../../../utils/GetDistanceFromLatLoInMeters";

import Routing from "../../map/routing";

import iconpharma from "../../../assets/iconpharma.png";
import { Heart, MessageSquare, Search, MapPin, Pill, Upload, Loader2 } from "lucide-react";

// Leaflet Icon Fix for standard markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pharmacyIcon = L.icon({
  iconUrl: iconpharma,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function RecenterMap({ position, followUser }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    if (!followUser) return;
    map.setView(position, 15);
  }, [map, position, followUser]);
  return null;
}

function formatDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function normalizePharmacyFromApi(p) {
  return {
    id: p?.id,
    name: p?.name ?? p?.pharmacy_name ?? p?.pharmacy_name_en ?? p?.pharmacy_name_am ?? "Pharmacy",
    address: typeof p?.address === "string" ? p.address : "",
    distance: p?.distance ?? null,
    open: p?.open ?? null,
    stock: p?.stock ?? null,
    price: p?.price ?? p?.pivot?.price ?? null,
    lat: p?.lat ?? p?.latitude ?? null,
    lng: p?.lng ?? p?.longitude ?? null,
    raw: p,
  };
}

function extractPrescriptionPharmacies(apiResponse) {
  const direct = apiResponse?.pharmacies;
  const nested1 = apiResponse?.data?.pharmacies;
  const nested2 = apiResponse?.data?.result?.pharmacies;
  const list = direct ?? nested1 ?? nested2;
  if (Array.isArray(list)) return list;
  if (Array.isArray(apiResponse)) return apiResponse;
  return [];
}

export default function MapView({ favorites, isFavorite, onToggleFavorite, onFacilityViewed, onRequestChat }) {
  const [userLocation, setUserLocation] = useState(null); // {lat, lng}
  const [geoError, setGeoError] = useState("");

  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState("");

  const [facilityQuery, setFacilityQuery] = useState("");
  const [facilityType, setFacilityType] = useState("all"); // all | hospital | pharmacy

  const [routeTo, setRouteTo] = useState(null); // facility
  const [followUser, setFollowUser] = useState(true);

  // Drug availability search
  const [drugQuery, setDrugQuery] = useState("");
  const [drugLoading, setDrugLoading] = useState(false);
  const [drugError, setDrugError] = useState("");
  const [drugResults, setDrugResults] = useState([]);

  // Prescription upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingPrescription, setIsProcessingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");
  const [prescriptionPharmacies, setPrescriptionPharmacies] = useState([]);
  const fileInputRef = useRef(null);

  const defaultCenter = useMemo(() => [12.6000, 37.4500], []);

  useEffect(() => {
    let watchId = null;
    if (!navigator.geolocation) return;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError("");
      },
      () => setGeoError("Location access denied. You can still browse facilities, but routes may be limited."),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    );

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setFacilitiesLoading(true);
    setFacilitiesError("");

    apiFetchFacilities()
      .then((rows) => {
        if (!alive) return;
        setFacilities(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (!alive) return;
        setFacilitiesError(e?.message || "Failed to load facilities.");
      })
      .finally(() => {
        if (!alive) return;
        setFacilitiesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const facilitiesEnriched = useMemo(() => {
    return facilities.map((f) => {
      if (!userLocation || !Number.isFinite(f.lat) || !Number.isFinite(f.lng)) {
        return { ...f, distanceMeters: NaN };
      }
      return {
        ...f,
        distanceMeters: getDistanceFromLatLonInMeters(userLocation.lat, userLocation.lng, f.lat, f.lng),
      };
    });
  }, [facilities, userLocation]);

  const filteredFacilities = useMemo(() => {
    const q = facilityQuery.trim().toLowerCase();
    return facilitiesEnriched
      .filter((f) => (facilityType === "all" ? true : f.type === facilityType))
      .filter((f) => {
        if (!q) return true;
        return `${f.name || ""} ${f.address || ""}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const daOk = Number.isFinite(a.distanceMeters);
        const dbOk = Number.isFinite(b.distanceMeters);
        if (daOk && dbOk) return a.distanceMeters - b.distanceMeters;
        if (daOk) return -1;
        if (dbOk) return 1;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [facilitiesEnriched, facilityQuery, facilityType]);

  const routeFrom = userLocation ? [userLocation.lat, userLocation.lng] : null;
  const routeToLatLng = routeTo && Number.isFinite(routeTo.lat) && Number.isFinite(routeTo.lng) ? [routeTo.lat, routeTo.lng] : null;

  const facilitiesById = useMemo(() => {
    const m = new Map();
    for (const f of facilities) {
      m.set(String(f.id), f);
    }
    return m;
  }, [facilities]);

  const handleOpenInMap = (facility) => {
    setRouteTo(facility);
    setFollowUser(false);
    onFacilityViewed?.(facility);
  };

  const handleFacilityCardClick = (facility) => {
    onFacilityViewed?.(facility);
    setRouteTo(facility);
    setFollowUser(false);
  };

  const handleDrugSearch = async () => {
    const q = drugQuery.trim();
    if (q.length < 2) return;

    setDrugLoading(true);
    setDrugError("");
    setDrugResults([]);

    try {
      if (!userLocation) {
        setDrugError("Enable location to find nearby pharmacies.");
        return;
      }

      await ensureCsrfCookie();
      const res = await apiFetch("/api/pharmacies/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: [q],
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius_km: 10,
        }),
      });

      const pharmacies = Array.isArray(res?.pharmacies) ? res.pharmacies : [];
      const enriched = pharmacies.map((p) => {
        const fac = facilitiesById.get(String(p.id));
        return {
          ...normalizePharmacyFromApi(p),
          type: "pharmacy",
          facility: fac ? { ...fac, type: "pharmacy" } : null,
        };
      });

      setDrugResults(enriched);
      if (enriched.length === 0) setDrugError("No nearby pharmacies found for this medicine.");
    } catch (e) {
      setDrugError(e?.message || "Drug availability search failed.");
    } finally {
      setDrugLoading(false);
    }
  };

  const handlePrescriptionUpload = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);
    setIsProcessingPrescription(true);
    setPrescriptionError("");
    setPrescriptionPharmacies([]);

    try {
      const uploadResult = await uploadPrescription(file);
      const pharmacies = extractPrescriptionPharmacies(uploadResult);
      // Simulate additional processing time for better UX
      await new Promise((r) => setTimeout(r, 1400));

      const normalized = pharmacies.map((p) => {
        const fac = facilitiesById.get(String(p.id));
        return {
          ...normalizePharmacyFromApi(p),
          type: "pharmacy",
          facility: fac ? { ...fac, type: "pharmacy" } : null,
        };
      });

      setPrescriptionPharmacies(normalized);
      if (normalized.length === 0) setPrescriptionError("No pharmacies could fulfill this prescription nearby.");
    } catch (e) {
      setPrescriptionError(e?.message || "Prescription processing failed.");
    } finally {
      setIsProcessingPrescription(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Side panel (facility list + drug + prescription) */}
        <aside className="md:col-span-4 lg:col-span-5 order-2 lg:order-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold">Facility Search</h2>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                  {userLocation ? "Sorted by your distance (when possible)." : "Enable location for distance sorting & route drawing."}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300 font-extrabold">
                <MapPin size={18} />
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={facilityQuery}
                  onChange={(e) => setFacilityQuery(e.target.value)}
                  placeholder="Search by name or address..."
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "hospital", label: "Hospitals" },
                  { value: "pharmacy", label: "Pharmacies" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFacilityType(opt.value)}
                    className={[
                      "flex-1 px-3 py-2 rounded-xl border text-sm font-extrabold transition-colors",
                      facilityType === opt.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/60",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {geoError && (
              <div className="mt-4 text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                {geoError}
              </div>
            )}

            {facilitiesError && (
              <div className="mt-4 text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                {facilitiesError}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-300">
                <span>Results</span>
                <span>{facilitiesLoading ? "Loading..." : `${filteredFacilities.length}`}</span>
              </div>

              {facilitiesLoading ? (
                <div className="mt-4 text-sm text-slate-600 dark:text-gray-300">Loading facilities…</div>
              ) : filteredFacilities.length === 0 ? (
                <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                  <p className="font-extrabold">No facilities found</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Try a different keyword or switch types.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredFacilities.slice(0, 10).map((f) => {
                    const distanceLabel = formatDistance(f.distanceMeters);
                    const fav = isFavorite?.(f);
                    return (
                      <div key={`${f.type}:${String(f.id)}`} className="border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleFacilityCardClick(f)}
                            className="text-left flex-1 min-w-0"
                          >
                            <p className="font-extrabold truncate">{f.name}</p>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate">
                              {f.type === "hospital" ? "Hospital" : "Pharmacy"}
                              {distanceLabel ? ` · ${distanceLabel}` : ""}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleFavorite?.(f)}
                            className={[
                              "shrink-0 p-2 rounded-xl transition-colors",
                              fav ? "bg-blue-600/10 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-gray-700/60 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-700",
                            ].join(" ")}
                            aria-label="Toggle favorite"
                            title="Save"
                          >
                            <Heart size={16} className={fav ? "fill-current" : ""} />
                          </button>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => handleOpenInMap(f)}
                            className="flex-1 rounded-xl bg-blue-600 text-white py-2.5 font-extrabold text-xs hover:bg-blue-700 transition-colors"
                          >
                            Open in Map
                          </button>
                          {f.type === "pharmacy" ? (
                            <button
                              type="button"
                              onClick={() => onRequestChat?.(f)}
                              className="rounded-xl bg-slate-100 dark:bg-gray-700/60 text-slate-700 dark:text-slate-200 py-2.5 px-2 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                              title="Message pharmacy agent"
                            >
                              <MessageSquare size={14} />
                              Chat
                            </button>
                          ) : (
                            <div className="flex-1 rounded-xl bg-slate-100 dark:bg-gray-700/40 text-slate-400 py-2.5 font-extrabold text-xs text-center cursor-not-allowed border border-dashed border-slate-300 dark:border-gray-600">
                              Chat
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Drug availability search */}
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold">Drug Availability</h2>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Find nearby pharmacies with this medicine in stock.</p>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300 font-extrabold">
                <Pill size={18} />
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={drugQuery}
                  onChange={(e) => setDrugQuery(e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDrugSearch();
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleDrugSearch}
                disabled={drugLoading || drugQuery.trim().length < 2}
                className="w-16 rounded-xl bg-blue-600 text-white py-3 font-extrabold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search drug availability"
              >
                {drugLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : <Search size={18} className="mx-auto" />}
              </button>
            </div>

            {drugError && (
              <div className="mt-3 text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                {drugError}
              </div>
            )}

            <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {drugResults.length === 0 && !drugLoading ? (
                <div className="border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                  <p className="font-extrabold">No results yet</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Type a medicine name to see nearby pharmacies.</p>
                </div>
              ) : (
                drugResults.map((p) => (
                  <div key={String(p.id)} className="border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold truncate">{p.name}</p>
                        <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                          {p.distance != null ? `${p.distance} km away` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-200">
                      <span className="font-extrabold">Stock:</span>{" "}
                      <span>{p.stock ? String(p.stock) : "Available"}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                      <span className="font-extrabold">Price:</span>{" "}
                      <span>{p.price != null ? String(p.price) : "Ask in chat"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const facility = p.facility ? p.facility : { type: "pharmacy", id: p.id, name: p.name, address: p.address, lat: p.lat, lng: p.lng };
                        onRequestChat?.(facility);
                      }}
                      className="mt-3 w-full rounded-xl bg-blue-600 text-white py-2.5 font-extrabold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} />
                      Message pharmacy agent
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prescription upload */}
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold">Prescription Upload</h2>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Upload your prescription to find fulfillment pharmacies.</p>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300 font-extrabold">
                <Upload size={18} />
              </span>
            </div>

            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) handlePrescriptionUpload(file);
                }}
              />

              <div
                className={[
                  "rounded-2xl border-2 border-dashed p-5 bg-slate-50 dark:bg-gray-900/30",
                  isUploading ? "opacity-60" : "hover:bg-slate-100 dark:hover:bg-gray-800/40 transition-colors",
                ].join(" ")}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer?.files?.[0] ?? null;
                  if (file) handlePrescriptionUpload(file);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fileInputRef.current?.click();
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-extrabold">Drag & drop a file</p>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                      PDF or images supported. The system will simulate processing and show pharmacies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="shrink-0 rounded-xl bg-blue-600 text-white px-4 py-2 font-extrabold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-3 text-xs text-slate-600 dark:text-gray-300">
                  Selected: <span className="font-extrabold">{selectedFile.name}</span>
                </div>
              )}
            </div>

            {prescriptionError && (
              <div className="mt-4 text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                {prescriptionError}
              </div>
            )}

            <div className="mt-4">
              {isUploading || isProcessingPrescription ? (
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 size={22} className="animate-spin text-blue-600" />
                    <div>
                      <p className="font-extrabold">Processing</p>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                        Extracting medicines and finding nearby pharmacies…
                      </p>
                    </div>
                  </div>
                </div>
              ) : prescriptionPharmacies.length === 0 ? (
                <div className="mt-4 border border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-4 text-center bg-slate-50 dark:bg-gray-900/40">
                  <p className="font-extrabold">Upload to see results</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">We’ll list pharmacies that can fulfill your prescription.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                  {prescriptionPharmacies.map((p) => (
                    <div key={String(p.id)} className="border border-slate-200 dark:border-gray-700 rounded-2xl p-3 bg-white dark:bg-gray-900/30">
                      <p className="font-extrabold">{p.name}</p>
                      <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{p.address ? p.address : "Address unavailable"}</p>
                      <div className="mt-2 text-xs text-slate-700 dark:text-slate-200">
                        <span className="font-extrabold">Stock:</span> <span>{p.stock ? String(p.stock) : "Available"}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                        <span className="font-extrabold">Price:</span> <span>{p.price != null ? String(p.price) : "Ask in chat"}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onFacilityViewed?.(p.facility ?? { type: "pharmacy", id: p.id, name: p.name, address: p.address, lat: p.lat, lng: p.lng })}
                          className="flex-1 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200 py-2.5 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"
                        >
                          Save to recents
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onRequestChat?.(p.facility ?? { type: "pharmacy", id: p.id, name: p.name, address: p.address, lat: p.lat, lng: p.lng })
                          }
                          className="flex-1 rounded-xl bg-blue-600 text-white py-2.5 font-extrabold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} />
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Map */}
        <div className="md:col-span-8 lg:col-span-7 order-1 lg:order-2 z-20">
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800/40">
            <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-extrabold text-base truncate">Live Facilities Map</h2>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                  {routeTo
                    ? `Route: ${routeTo.name} (${routeTo.type === "hospital" ? "Hospital" : "Pharmacy"})`
                    : "Pick a facility from the list to draw a route."}
                </p>
              </div>
              {routeTo && userLocation && routeToLatLng ? (
                <button
                  type="button"
                  onClick={() => {
                    setRouteTo(null);
                    setFollowUser(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-gray-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors text-sm font-extrabold"
                >
                  Clear Route
                </button>
              ) : (
                <div className="text-xs text-slate-600 dark:text-gray-300">{userLocation ? "Tracking enabled" : "Tracking unavailable"}</div>
              )}
            </div>

            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
              zoom={13}
              className="w-full"
              style={{ height: "520px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} />}

              {facilitiesLoading ? null : (
                <>
                  {filteredFacilities.slice(0, 60).map((f) => (
                    <Marker
                      key={`${f.type}:${String(f.id)}`}
                      position={[f.lat, f.lng]}
                      icon={f.type === "pharmacy" ? pharmacyIcon : new L.Icon.Default()}
                    >
                      <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                        <span className="font-bold">{f.name}</span>
                      </Tooltip>
                      <Popup>
                        <div className="p-1" style={{ minWidth: 220 }}>
                          <h3 className="text-sm font-bold border-b pb-1 mb-1">{f.name}</h3>
                          <p className="text-xs text-slate-600 dark:text-gray-300">
                            Type: <span className="font-semibold">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</span>
                          </p>
                          {f.address ? (
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                              {f.address}
                            </p>
                          ) : null}

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenInMap(f)}
                              className="bg-blue-600 text-white text-[11px] py-2 rounded-lg font-extrabold hover:bg-blue-700 transition-colors"
                            >
                              Open in Map
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleFavorite?.(f)}
                              className="bg-slate-100 dark:bg-gray-700/60 text-slate-800 dark:text-slate-200 text-[11px] py-2 rounded-lg font-extrabold hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <span className="inline-flex items-center justify-center gap-2">
                                <Heart size={14} className={isFavorite?.(f) ? "fill-current" : ""} />
                                {isFavorite?.(f) ? "Saved" : "Save"}
                              </span>
                            </button>
                          </div>

                          {f.type === "pharmacy" ? (
                            <button
                              type="button"
                              onClick={() => onRequestChat?.(f)}
                              className="mt-2 w-full bg-slate-900 dark:bg-blue-600 text-white text-[11px] py-2 rounded-lg font-extrabold hover:opacity-90 transition-colors"
                            >
                              Message pharmacy agent
                            </button>
                          ) : null}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </>
              )}

              {/* Route drawing */}
              {routeFrom && routeToLatLng ? (
                <>
                  <RecenterMap position={[routeToLatLng[0], routeToLatLng[1]]} followUser={true} />
                  <Routing from={routeFrom} to={routeToLatLng} />
                </>
              ) : (
                <RecenterMap position={userLocation ? [userLocation.lat, userLocation.lng] : null} followUser={followUser} />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

