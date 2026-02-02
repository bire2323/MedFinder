import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft, Search, Navigation, MapPin } from "lucide-react";
import iconpharma from "../../assets/iconpharma.png";
import { useNavigate } from "react-router-dom";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";
import Routing from "./routing";

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
    if (position && followUser) {
      map.setView(position, map.getZoom());
    }
  }, [position, map, followUser]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]); // This will hold the API data
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [followUser, setFollowUser] = useState(true);
 useEffect(() => {
  fetch('http://localhost:8000/api/medical-facilities')
    .then(res => res.json())
    .then(data => {
      // Data normalization to flatten the 'addresses' array
      const normalizedData = data.map(f => {
        // Get the first address from the addresses array
        const mainAddress = f.addresses && f.addresses.length > 0 ? f.addresses[0] : null;

        return {
          ...f,
          // Unique ID to avoid conflicts between hospital/pharmacy IDs
          id: `${f.type}-${f.id}`, 
          // Uniform name field
          name: f.hospital_name_en || f.pharmacy_name_en,
          // Extract lat/lng from the first address object and convert to numbers
          lat: mainAddress ? parseFloat(mainAddress.latitude) : null,
          lng: mainAddress ? parseFloat(mainAddress.longitude) : null,
        };
      }).filter(f => f.lat !== null && f.lng !== null); // Filter out facilities without coordinates

      setFacilities(normalizedData);
    })
    .catch(err => console.error("API Fetch Error:", err));
}, []);

  // 2. Live User Tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (loc) => {
        const pos = [loc.coords.latitude, loc.coords.longitude];
        setUserLocation(pos);
      },
      () => console.error("Location access denied"),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 3. Distance Calculation & Sorting
  const sortedFacilities = userLocation && facilities.length > 0
    ? facilities
        .map((p) => ({
          ...p,
          distance: getDistanceFromLatLonInMeters(
            userLocation[0],
            userLocation[1],
            p.lat,
            p.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : [];

  // 4. Search Filter
  const filteredPlaces = searchQuery.trim()
    ? facilities.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const routeDestination = selectedDestination
    ? [selectedDestination.lat, selectedDestination.lng]
    : sortedFacilities.length > 0
    ? [sortedFacilities[0].lat, sortedFacilities[0].lng]
    : null;

  return (
    <div className="relative w-screen h-screen">
      {/* Search UI */}
      <div className="absolute top-4 left-14 right-4 sm:left-auto sm:right-52 sm:w-72 z-[1000]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("Map.SearchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-400 shadow-lg outline-none"
          />
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => { setSelectedDestination(place); setSearchQuery(""); }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <MapPin size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium">{place.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer center={[12.6000, 37.4500]} zoom={13} className="h-full w-full z-0">
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {userLocation && <RecenterMap position={userLocation} followUser={followUser} />}

        {/* User Marker */}
        {userLocation && <Marker position={userLocation}><Popup>You are here</Popup></Marker>}

        {/* Dynamic Markers from API */}
        {/* ... inside your MapPage return ... */}

{facilities.map((place) => (
  <Marker 
    key={place.id} 
    position={[place.lat, place.lng]} 
    icon={place.type === 'pharmacy' ? pharmacyIcon : new L.Icon.Default()}
  >
    {/* This makes the name appear when you HOVER over the marker */}
    <Tooltip direction="top" offset={[0, -32]} opacity={1}>
      <span className="font-bold">{place.name}</span>
    </Tooltip>

    {/* This makes the name and details appear when you CLICK the marker */}
    <Popup>
      <div className="p-1">
        <h3 className="text-sm font-bold border-b pb-1 mb-1">
          {place.name}
        </h3>
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Type:</span> {place.type === 'hospital' ? '🏥 Hospital' : '💊 Pharmacy'}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Sub-city:</span> {place.addresses[0]?.sub_city_en}
        </p>
        
        <button 
           onClick={() => setSelectedDestination(place)}
           className="mt-3 w-full bg-blue-600 text-white text-[10px] py-1.5 rounded hover:bg-blue-700 transition-colors uppercase font-bold"
        >
          {t("Map.GetDirections") || "Get Directions"}
        </button>
      </div>
    </Popup>
  </Marker>
))}

        {userLocation && routeDestination && (
          <Routing from={userLocation} to={routeDestination} />
        )}
      </MapContainer>
    </div>
  );
}