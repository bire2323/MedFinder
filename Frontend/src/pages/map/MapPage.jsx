/**
 * MapPage - Leaflet map with facility search, routing to nearest facility, and live navigation
 */
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft, Search, Navigation, MapPin } from "lucide-react";
import iconpharma from "../../assets/iconpharma.png";
import { useNavigate } from "react-router-dom";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";
import { LayersControl } from "react-leaflet";
import Routing from "./routing";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Sample facilities (Addis Ababa area)
const defaultLocations = [
  { id: 1, name: "Central Pharmacy", type: "pharmacy", lat: 9.0054, lng: 38.7636 },
  { id: 2, name: "Bole Hospital", type: "hospital", lat: 9.0123, lng: 38.7720 },
  { id: 3, name: "Megenagna Pharmacy", type: "pharmacy", lat: 9.0189, lng: 38.7850 },
  { id: 4, name: "St. Gabriel Hospital", type: "hospital", lat: 8.9980, lng: 38.7520 },
  { id: 5, name: "Edna Mall Pharmacy", type: "pharmacy", lat: 9.0080, lng: 38.7680 },
];

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
  const {t}=useTranslation();

  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState(defaultLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [followUser, setFollowUser] = useState(true);

  const { BaseLayer } = LayersControl;

  // Live user location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (loc) => {
        const pos = [loc.coords.latitude, loc.coords.longitude];
        localStorage.setItem("lat", loc.coords.latitude);
        localStorage.setItem("lng", loc.coords.longitude);
        setUserLocation(pos);
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Nearest facilities sorted by distance (shortest path / straight-line)
  const sortedFacilities =
    userLocation &&
    places
      .map((p) => ({
        ...p,
        distance: getDistanceFromLatLonInMeters(
          userLocation[0],
          userLocation[1],
          p.lat,
          p.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

  // Search filtered places
  const filteredPlaces = searchQuery.trim()
    ? places.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : places;

  // Routing destination: selected from search or nearest facility
  const routeDestination = selectedDestination
    ? [selectedDestination.lat, selectedDestination.lng]
    : sortedFacilities?.[0]
    ? [sortedFacilities[0].lat, sortedFacilities[0].lng]
    : null;

  const handleSelectPlace = (place) => {
    setSelectedDestination(place);
    setSearchQuery("");
  };

  return (
    <div className="relative w-screen h-screen min-w-[320px]">
      {/* Back button */}
      <button
        className="absolute top-4 left-4 z-[1000] p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => navigate("/")}
        aria-label="Back to home"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Search bar */}
      <div className="absolute top-4 left-14 right-4 sm:left-auto sm:right-52 sm:w-72 z-[1000]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("Map.SearchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-500 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-500 shadow-lg max-h-48 overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">{t("Common.Search")} - No results</p>
              ) : (
                filteredPlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <MapPin size={16} className="text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{place.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{place.type}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live nav toggle & nearest info */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setFollowUser(!followUser)}
          className={`p-2.5 rounded-xl shadow-lg border transition-colors flex items-center gap-2 ${
            followUser
              ? "bg-blue-500 text-white border-blue-600"
              : "bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500"
          }`}
          title={followUser ? "Following your location" : "Click to follow"}
        >
          <Navigation size={18} className={followUser ? "animate-pulse" : ""} />
          <span className="hidden sm:inline text-xs font-medium">{t("Map.Live")}</span>
        </button>
        {sortedFacilities?.[0] && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-500 shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {t("Map.Nearest")}: {selectedDestination?.name || sortedFacilities[0].name}
            </p>
            <p className="text-gray-500">
              ~{Math.round(sortedFacilities[0].distance / 1000)} km
            </p>
          </div>
        )}
      </div>

      <MapContainer
        center={userLocation || [9.0054, 38.7636]}
        zoom={14}
        className="h-screen w-full z-0"
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri"
            />
          </BaseLayer>
        </LayersControl>

        {userLocation && <RecenterMap position={userLocation} followUser={followUser} />}

        {/* User marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Facility markers */}
        {places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]} icon={pharmacyIcon}>
            <Popup>
              <b>{place.name}</b>
              <br />
              <span className="capitalize text-gray-500">{place.type}</span>
              <br />
              <button
                onClick={() => handleSelectPlace(place)}
                className="mt-2 text-blue-500 text-sm font-medium hover:underline"
              >
                {t("Map.GetDirections")}
              </button>
            </Popup>
          </Marker>
        ))}

        {/* Live routing: user → nearest/selected facility */}
        {userLocation && routeDestination && (
          <Routing from={userLocation} to={routeDestination} />
        )}
      </MapContainer>
    </div>
  );
}
