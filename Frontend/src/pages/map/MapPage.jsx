import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft, Search, Navigation, MapPin } from "lucide-react";
import iconpharma from "../../assets/iconpharma.png";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
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
      map.setView(position, 16); // Set to 16 for better facility focus
    }
  }, [position, map, followUser]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation(); // To accept facility from card
  const { t } = useTranslation();

  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const [loading, setLoading] = useState(false); // Restored loading state
  const [isSearchFocused, setIsSearchFocused] = useState(false); // For auto-stretch

  // 1. Accept facility passed from ResultCard
  useEffect(() => {
    if (location.state?.selectedFacility) {
      const facility = location.state.selectedFacility;
      setSelectedDestination(facility);
      setFollowUser(false); 
    }
  }, [location.state]);

  // 2. Data Fetching (Restored exactly as provided)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiGetFacilities();
        if (res.success) {
          const data = res?.data || [];
          setFacilities(data);
        }
      } catch (error) {
        console.log("Error fetching facilities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    fetch('http://localhost:8000/api/medical-facilities')
      .then(res => res.json())
      .then(data => {
        const normalizedData = data.data.map(f => {
          const mainAddress = f.addresses && f.addresses.length > 0 ? f.addresses[0] : null;
          return {
            ...f,
            id: `${f.type}-${f.id}`,
            name: f.hospital_name_en || f.pharmacy_name_en,
            lat: mainAddress ? parseFloat(mainAddress.latitude) : null,
            lng: mainAddress ? parseFloat(mainAddress.longitude) : null,
          };
        }).filter(f => f.lat !== null && f.lng !== null);

        setFacilities(normalizedData);
      })
      .catch(err => console.error("API Fetch Error:", err));
  }, []);

  // 3. Live User Tracking
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

  // 4. Distance Calculation & Sorting
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

  // 5. Search Filter
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
      {/* Search UI with Auto-Stretch logic */}
      <div className={`absolute top-4 left-14 z-[1000] transition-all duration-300 ease-in-out 
        ${isSearchFocused || searchQuery ? 'right-4 sm:w-96' : 'w-48 sm:w-72'}`}>
        
        <div className="relative group">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="hover:bg-gray-100 rounded-full p-1 transition-colors">
               <ChevronLeft size={20} className="text-gray-500" />
            </button>
            {!isSearchFocused && !searchQuery && <Search size={18} className="text-gray-400 mr-4" />}
          </div>

          <input
            type="text"
            placeholder={isSearchFocused || searchQuery ? t("Map.SearchPlaceholder") : "..."}
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 dark:text-white rounded-xl border border-gray-400 shadow-lg outline-none focus:ring-2 focus:ring-green-300 transition-all"
          />

          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => { setSelectedDestination(place); setFollowUser(false); setSearchQuery(""); }}
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

        {/* Dynamic Recenter: Targets user OR the specifically called facility */}
        {followUser && userLocation && <RecenterMap position={userLocation} followUser={followUser} />}
        {!followUser && selectedDestination && <RecenterMap position={[selectedDestination.lat, selectedDestination.lng]} followUser={true} />}

        {userLocation && <Marker position={userLocation}><Popup>You are here</Popup></Marker>}

        {facilities.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={place.type === 'pharmacy' ? pharmacyIcon : new L.Icon.Default()}
          >
            <Tooltip direction="top" offset={[0, -32]} opacity={1}>
              <span className="font-bold">{place.name}</span>
            </Tooltip>

            <Popup>
              <div className="p-1">
                <h3 className="text-sm font-bold border-b pb-1 mb-1">{place.name}</h3>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Type:</span> {place.type === 'hospital' ? '🏥 Hospital' : '💊 Pharmacy'}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Sub-city:</span> {place.addresses?.[0]?.sub_city_en}
                </p>

                <button
                  onClick={() => { setSelectedDestination(place); setFollowUser(false); }}
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