import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { useLocation, useOutletContext } from "react-router-dom";

import { apiFetchFacilities } from "../../../api/search";
import getDistanceFromLatLonInMeters from "../../../utils/GetDistanceFromLatLoInMeters";

import Routing from "../../map/Routing";

import iconpharma from "../../../assets/iconpharma.png";
import { Heart, MessageSquare, Search, MapPin, AlertCircle, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import useLocationStore from "../../../store/useLocationStore";

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

export default function MapView({
    favorites: propFavs,
    isFavorite: propIsFav,
    onToggleFavorite: propToggleFav,
    onFacilityViewed: propViewed,
    onRequestChat: propChat
}) {
    const { t } = useTranslation();
    const location = useLocation();

    // Pull defensively from React Router's Outlet Context if props are undefined
    const context = useOutletContext() || {};
    const favorites = propFavs ?? context.favorites ?? [];
    const isFavorite = propIsFav ?? context.isFavorite;
    const onToggleFavorite = propToggleFav ?? context.toggleFavorite;
    const onFacilityViewed = propViewed ?? context.addRecent;
    const onRequestChat = propChat ?? context.requestChatWithFacility;

    const { coordinates: storeLocation, detectLocation, permissionState, permissionError } = useLocationStore();
    const [userLocation, setUserLocation] = useState(storeLocation);
    const [geoError, setGeoError] = useState("");

    const [facilities, setFacilities] = useState([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [facilitiesError, setFacilitiesError] = useState("");

    const [facilityQuery, setFacilityQuery] = useState("");
    const [facilityType, setFacilityType] = useState("all");

    const [routeTo, setRouteTo] = useState(null);
    const [followUser, setFollowUser] = useState(permissionState !== "denied" && !!storeLocation);

    // const [permissionState, setPermissionState] = useState("prompt");
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const defaultCenter = useMemo(() => [12.6000, 37.4500], []);

    useEffect(() => {
        if (storeLocation) setUserLocation(storeLocation);
    }, [storeLocation]);

    // Show alert when permission is denied
    useEffect(() => {
        if (permissionState === "denied") {
            setGeoError(permissionError || "Location access is not granted. Location-based features (nearby search, live tracking, map centering) are disabled.");
        }
    }, [permissionState, permissionError]);

    // Parse incoming URL query parameters (e.g. from favorites/recents redirects)
    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search);
            const latStr = params.get("lat");
            const lngStr = params.get("lng");
            const name = params.get("name");

            if (latStr && lngStr) {
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    // Try to enrich facility details using coordinates if already loaded in facilities list
                    const matched = facilities.find(f =>
                        Math.abs(f.lat - lat) < 0.0001 &&
                        Math.abs(f.lng - lng) < 0.0001
                    );

                    const targetFacility = matched ? matched : {
                        id: params.get("id") ?? "query-target",
                        name: name ?? "Selected Facility",
                        lat,
                        lng,
                        type: params.get("type") ?? "hospital"
                    };

                    setRouteTo(targetFacility);
                    setFollowUser(false);
                    setOpenMap(true);

                    // Mark as viewed
                    if (onFacilityViewed) {
                        onFacilityViewed(targetFacility);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to parse map query parameters:", e);
        }
    }, [location.search, facilities, onFacilityViewed]);

    const handleGetLocation = useCallback(async () => {
        setIsLocationLoading(true);
        setGeoError("");
        try {
            const coords = await detectLocation();
            setUserLocation(coords);
            setPermissionState("granted");
        } catch (err) {
            console.error("Geolocation error:", err);
            setGeoError(err.message || t("Map.TrackingUnavailable"));
            if (err?.code === 1) setPermissionState("denied");
        } finally {
            setIsLocationLoading(false);
        }
    }, [detectLocation, t]);

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
                setFacilitiesError(e?.message || t("error.generic_error"));
            })
            .finally(() => {
                if (!alive) return;
                setFacilitiesLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [t]);

    const facilitiesEnriched = useMemo(() => {
        return facilities.map((f) => {
            if (!userLocation || !Number.isFinite(f.lat) || !Number.isFinite(f.lng)) return { ...f, distanceMeters: NaN };
            return { ...f, distanceMeters: getDistanceFromLatLonInMeters(userLocation.lat, userLocation.lng, f.lat, f.lng) };
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
        for (const f of facilities) m.set(String(f.id), f);
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
    const [openMap, setOpenMap] = useState(false);
    return (
        <div className="px-4 py-6">
            <div className="max-w-full sm:max-w-7xl mx-auto">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        <aside className={`${openMap ? 'hidden md:block md:col-span-4 lg:col-span-5' : 'block md:col-span-4 lg:col-span-5'} order-2 lg:order-1 space-y-4`}>
                            <div className="rounded-2xl border border-slate-100 dark:border-gray-800/80 bg-white dark:bg-gray-955/40 p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <MapPin size={18} className="text-emerald-500 shrink-0" />
                                            {t("Map.FacilitySearch")}
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{userLocation ? t("Map.SortedByDistance") : t("Map.EnableLocationForDistance")}</p>
                                    </div>
                                    <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 shadow-inner">
                                        <MapPin size={18} />
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={facilityQuery}
                                            onChange={(e) => setFacilityQuery(e.target.value)}
                                            placeholder={t("Map.SearchByNameOrAddress")}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-200"
                                        />
                                    </div>

                                    <div className="flex p-1 bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 rounded-xl gap-1">
                                        {[
                                            { value: "all", label: t("Map.All") },
                                            { value: "hospital", label: t("Map.Hospitals") },
                                            { value: "pharmacy", label: t("Map.Pharmacies") },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setFacilityType(opt.value)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${facilityType === opt.value
                                                    ? "bg-emerald-600 text-white shadow-sm"
                                                    : "text-slate-600 hover:text-slate-800 dark:text-gray-400 dark:hover:text-slate-200 bg-transparent"
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {geoError && (
                                    <div className="mt-4 text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 p-4 text-rose-800 dark:text-rose-200">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-bold">{t("Map.LocationError")}</p>
                                                <p className="mt-1">{geoError}</p>
                                                <button
                                                    onClick={handleGetLocation}
                                                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm shadow-rose-600/10 transition-colors"
                                                >
                                                    <MapPin size={12} />
                                                    {t("Map.RetryAccess")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {facilitiesError && (
                                    <div className="mt-4 text-sm rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 p-3 text-rose-800 dark:text-rose-200">
                                        {facilitiesError}
                                    </div>
                                )}

                                <div className="mt-5 space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        <span>{t("Map.Results")}</span>
                                        <span>{facilitiesLoading ? t("Common.Loading") : `${filteredFacilities.length}`}</span>
                                    </div>

                                    {facilitiesLoading ? (
                                        <div className="mt-4 text-sm text-slate-500 dark:text-gray-400">Loading facilities…</div>
                                    ) : filteredFacilities.length === 0 ? (
                                        <div className="border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl py-8 px-4 text-center bg-slate-50/50 dark:bg-gray-900/10">
                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("Map.NoFacilitiesFound")}</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t("Map.TryDifferentKeyword")}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                                            {filteredFacilities.slice(0, 10).map((f) => {
                                                const distanceLabel = formatDistance(f.distanceMeters);
                                                const fav = isFavorite?.(f);
                                                return (
                                                    <div key={`${f.type}:${String(f.id)}`} className="group border border-slate-100 dark:border-gray-800/80 rounded-2xl p-4 bg-white dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-900/60 transition-all duration-250 shadow-sm relative overflow-hidden">
                                                        <div className="flex items-start justify-between gap-3 mb-3.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFacilityCardClick(f)}
                                                                className="text-left flex-1 min-w-0"
                                                            >
                                                                <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{f.name}</p>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${f.type === "hospital"
                                                                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                                                                        : "bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400"
                                                                        }`}>
                                                                        {f.type === "hospital" ? t("Map.hospital") : t("Map.pharmacy")}
                                                                    </span>
                                                                    {distanceLabel && (
                                                                        <span className="text-[11px] text-slate-400 dark:text-gray-500 flex items-center gap-0.5 font-medium">
                                                                            <MapPin size={10} />
                                                                            {distanceLabel}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onToggleFavorite?.(f)}
                                                                className={`shrink-0 p-2 rounded-xl transition-all duration-200 shadow-sm ${fav
                                                                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                                                                    : "bg-slate-50 dark:bg-gray-800/80 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700/80"
                                                                    }`}
                                                                aria-label={t("Map.Save")}
                                                                title={t("Map.Save")}
                                                            >
                                                                <Heart size={14} className={fav ? "fill-current" : ""} />
                                                            </button>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleOpenInMap(f);
                                                                    setOpenMap(true);
                                                                }}
                                                                className="flex-1 rounded-xl bg-emerald-600 text-white py-2.5 font-bold text-[11px] hover:bg-emerald-700 shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all duration-200"
                                                            >
                                                                {t("Map.OpenInMap")}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onRequestChat?.(f)}
                                                                className="flex-1 rounded-xl bg-slate-50 dark:bg-gray-800/80 text-slate-700 dark:text-slate-200 py-2.5 px-2 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-100 dark:border-gray-850"
                                                                title={f.type === "hospital" ? t("Map.MessageHospital") : t("Map.MessagePharmacy")}
                                                            >
                                                                <MessageSquare size={12} className="text-slate-400" />
                                                                {t("UserDashboard.Messages")}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Map Container */}
                        <div className={`${openMap ? 'block md:col-span-8 lg:col-span-7' : 'hidden md:block md:col-span-8 lg:col-span-7'} order-1 lg:order-2 z-20`}>
                            <div className="rounded-2xl border border-slate-100 dark:border-gray-800/80 overflow-hidden bg-white dark:bg-gray-955/40 shadow-sm">
                                <div className="p-4 border-b border-slate-100 dark:border-gray-900 flex flex-col items-center justify-between gap-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
                                    <div className="flex w-full justify-between items-center">
                                        <div className="min-w-0 flex justify-baseline items-center">
                                            <div className="flex items-center justify-start gap-2">
                                                <button onClick={() => setOpenMap(false)} className="p-1 rounded-lg bg-slate-100 dark:bg-gray-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                                                    <ChevronLeft className="block md:hidden cursor-pointer text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-50" />
                                                </button>
                                                <div className="flex flex-col items-start justify-start">
                                                    <h2 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white truncate">{t("Map.LiveFacilitiesMap")}</h2>
                                                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                                        {routeTo
                                                            ? `${t("Register.Location")}: ${routeTo.name} (${routeTo.type === "hospital" ? t("Map.hospital") : t("Map.pharmacy")})`
                                                            : t("Map.PickAFacility")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {routeTo && userLocation && routeToLatLng ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setRouteTo(null);
                                                        setFollowUser(true);
                                                    }}
                                                    className="px-3 py-2 rounded-xl bg-slate-55 dark:bg-gray-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-xs font-bold border border-slate-100 dark:border-gray-800 shadow-sm"
                                                >
                                                    {t("Map.ClearRoute")}
                                                </button>
                                            ) : (
                                                <div className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500 font-semibold">{userLocation ? t("Map.TrackingEnabled") : t("Map.TrackingUnavailable")}</div>
                                            )}
                                        </div>
                                    </div>


                                    <MapContainer
                                        center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
                                        zoom={13}
                                        className="w-full"
                                        style={{ height: "66vh", minHeight: 420 }}
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
                                                            <span className="font-bold text-slate-800">{f.name}</span>
                                                        </Tooltip>
                                                        <Popup>
                                                            <div className="p-1" style={{ minWidth: 220 }}>
                                                                <h3 className="text-sm font-bold border-b border-slate-100 pb-1 mb-1.5 text-slate-800">{f.name}</h3>
                                                                <p className="text-xs text-slate-550 mt-1">
                                                                    Type: <span className="font-semibold text-emerald-600">{f.type === "hospital" ? "Hospital" : "Pharmacy"}</span>
                                                                </p>
                                                                {f.address ? (
                                                                    <p className="text-xs text-slate-500 mt-1">{f.address}</p>
                                                                ) : null}

                                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenInMap(f)}
                                                                        className="bg-emerald-600 text-white text-[11px] py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/10"
                                                                    >
                                                                        Open in Map
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onToggleFavorite?.(f)}
                                                                        className="bg-slate-50 text-slate-700 text-[11px] py-2 rounded-lg font-bold hover:bg-slate-100 border border-slate-100 transition-colors"
                                                                    >
                                                                        <span className="inline-flex items-center justify-center gap-1.5 text-rose-500">
                                                                            <Heart size={12} className={isFavorite?.(f) ? "fill-current text-rose-500" : "text-rose-450"} />
                                                                            <span className="text-slate-700">{isFavorite?.(f) ? "Saved" : "Save"}</span>
                                                                        </span>
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => onRequestChat?.(f)}
                                                                    className="mt-2 w-full bg-emerald-600 text-white text-[11px] py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/10"
                                                                >
                                                                    {f.type === "hospital" ? "Message hospital agent" : "Message pharmacy agent"}
                                                                </button>
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
                </div>
            </div>
        </div>
    );
}

