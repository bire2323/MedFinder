import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft, Search, Navigation, MapPin, X, ArrowUp, Navigation2, Volume2, VolumeX } from "lucide-react";
import iconpharma from "../../assets/iconpharma.png";
import { useNavigate, useLocation } from "react-router-dom";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";
import Routing from "./Routing";
import { VoiceNavigator } from "./VoiceNavigator";
import { apiSmartPharmacySearch } from "../../api/routing";
import { enhanceRouteSteps } from "./enhanceRouteSteps";

// Initialize singleton instance
const voiceNav = new VoiceNavigator({
  proximityThreshold: 60,
  nowThreshold: 15,
});

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

function RecenterMap({ position, followUser, isNavigating }) {
  const map = useMap();
  const [hasInitialZoom, setHasInitialZoom] = useState(false);

  useEffect(() => {
    if (!position || !followUser) return;

    if (isNavigating) {
      if (!hasInitialZoom) {
        map.setView(position, 18, { animate: true });
        setHasInitialZoom(true);
      } else {
        map.panTo(position, { animate: true });
      }
    } else {
      map.setView(position, 16, { animate: true });
    }
  }, [position, map, followUser, isNavigating]);

  return null;
}
const BACKEND_URL = import.meta.env.VITE_API_BASE || "/api";
const API_BASE_URL = "/api";
export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation(); // To accept facility from card
  const { t } = useTranslation();

  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrugSearch, setIsDrugSearch] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lastRouteUpdatePos, setLastRouteUpdatePos] = useState(null);
  const [isMuted, setIsMuted] = useState(voiceNav.isMuted);

  // 1. Accept facility passed from ResultCard
  useEffect(() => {
    if (location.state?.selectedFacility) {
      const facility = location.state.selectedFacility;
      //console.log("location", location.state);
      setSelectedDestination(facility);
      setFollowUser(false);
    }
  }, [location.state]);

  // 2. Data Fetching (Restored exactly as provided)
  useEffect(() => {
    //  const fetchData = async () => {
    // setLoading(true);
    // try {
    //   const res = await apiGetFacilities();
    //   if (res.success) {
    //     const data = res?.data || [];
    //    setFacilities(data);
    //  }
    // } catch (error) {
    //  console.log("Error fetching facilities", error);
    //} finally {
    //  setLoading(false);
    // }
    // };
    //fetchData();

    fetch(`/api/medical-facilities`)
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
  //  useEffect(() => {
  //  if (!navigator.geolocation) return;
  //  const watchId = navigator.geolocation.watchPosition(
  //    (loc) => {
  //       const pos = [loc.coords.latitude, loc.coords.longitude];
  //       setUserLocation(pos);
  //     },
  //      () => console.error("Location access denied"),
  //      { enableHighAccuracy: true }
  ///   );
  //  return () => navigator.geolocation.clearWatch(watchId);
  // }, []);



  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;

        setUserLocation(prev => {
          if (!prev) return [newLat, newLng];
          // Smoothing logic
          return [
            prev[0] + (newLat - prev[0]) * 0.3,
            prev[1] + (newLng - prev[1]) * 0.3
          ];
        });
      },
      (err) => {
        console.error("Geolocation Error:", err.message);
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 1000, 
        timeout: 10000 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Separate effect for navigation updates (voice & route refresh)
  useEffect(() => {
    if (!isNavigating || !userLocation || !selectedDestination) return;

    // Update voice navigator with current smoothed position
    voiceNav.update(userLocation[0], userLocation[1]);
    
    // Sync current step index from voice navigator to UI
    if (voiceNav.currentStepIndex !== currentStepIndex) {
      setCurrentStepIndex(voiceNav.currentStepIndex);
    }

    // Refresh route if user moved significantly (>30 meters)
    if (lastRouteUpdatePos) {
      const distMoved = getDistanceFromLatLonInMeters(
        userLocation[0], userLocation[1],
        lastRouteUpdatePos[0], lastRouteUpdatePos[1]
      );

      if (distMoved > 30) {
        console.log(`User moved ${Math.round(distMoved)}m - refreshing route...`);
        setLastRouteUpdatePos(userLocation);
        // This setLastRouteUpdatePos will trigger a re-fetch in the Routing component
      }
    } else {
      // Set initial position for distance tracking
      setLastRouteUpdatePos(userLocation);
    }
  }, [userLocation, isNavigating, selectedDestination, currentStepIndex]);

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
    : null;

  const handleStartNavigation = async (initialRoute = null) => {
    if (!userLocation || !selectedDestination) {
      alert("Please ensure location is enabled and a destination is selected.");
      return;
    }

    console.log("Starting navigation...",initialRoute);
    setIsNavigating(true);
    setFollowUser(true);
    setLastRouteUpdatePos(userLocation);

    const routeToUse = initialRoute || currentRoute;
    if (routeToUse && routeToUse.steps) {
      console.log("Starting voice navigation...");
      voiceNav.start(routeToUse.steps);
      setCurrentStepIndex(voiceNav.currentStepIndex);
      if (!currentRoute) setCurrentRoute(routeToUse);
    }
  };

  const handleStopNavigation = () => {
    console.log("Stopping navigation flow...");
    setIsNavigating(false);
    setCurrentRoute(null);
    setLastRouteUpdatePos(null);
    voiceNav.stop();
  };

  const handleDrugSearch = async () => {
    if (!searchQuery.trim() || !userLocation) return;
    setLoading(true);
    try {
      const data = await apiSmartPharmacySearch(userLocation, searchQuery);
      
      if (data && data.success) {
        // Transform backend pharmacy data to match local facility format
        const p = data.pharmacy;
        const mainAddress = p.addresses[0];
        const normalizedPharma = {
          ...p,
          id: `pharmacy-${p.id}`,
          name: p.pharmacy_name_en,
          lat: parseFloat(mainAddress.latitude),
          lng: parseFloat(mainAddress.longitude),
          type: 'pharmacy'
        };

        setFacilities(prev => {
          const exists = prev.find(f => f.id === normalizedPharma.id);
          return exists ? prev : [...prev, normalizedPharma];
        });

        setSelectedDestination(normalizedPharma);
        handleStartNavigation(data.route);
        setSearchQuery("");
        setIsDrugSearch(false);
      } else {
        alert(data?.message || "No pharmacies found for this drug.");
      }
    } catch (error) {
      console.error("Smart search error:", error);
    } finally {
      setLoading(false);
    }
  };


  const toggleMute = () => {
    const newMute = voiceNav.toggleMute();
    setIsMuted(newMute);
  };

  function testSpeak() {
    if (currentRoute && currentRoute.steps[currentStepIndex]) {
      voiceNav.speak(currentRoute.steps[currentStepIndex], 'near');
    } else {
      voiceNav._executeSpeech("No route active. Please start navigation.");
    }
  }

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
            placeholder={isDrugSearch ? "Enter Drug Name..." : (isSearchFocused || searchQuery ? t("Map.SearchPlaceholder") : "...")}
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isDrugSearch && handleDrugSearch()}
            className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 dark:text-white rounded-xl border-2 shadow-lg outline-none transition-all
              ${isDrugSearch ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 focus:ring-2 focus:ring-green-300'}`}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setIsDrugSearch(!isDrugSearch)}
              className={`p-2 rounded-lg transition-colors ${isDrugSearch ? 'bg-emerald-500 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Search by Drug Name"
            >
              <Navigation size={18} />
            </button>
            {isDrugSearch && searchQuery && (
              <button
                onClick={handleDrugSearch}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Find drug
              </button>
            )}
          </div>

          {searchQuery && !isDrugSearch && (
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
        

        {/* Dynamic Recenter */}
        {followUser && userLocation && (
          <RecenterMap
            position={userLocation}
            followUser={followUser}
            isNavigating={isNavigating}
          />
        )}
        {!followUser && selectedDestination && (

          <RecenterMap
            position={[selectedDestination.lat, selectedDestination.lng]}
            followUser={true}
            isNavigating={false}
          />

        )}

        {userLocation && <Marker position={userLocation} icon={new L.DivIcon({
          className: 'custom-user-icon',
          html: `<div class="relative w-8 h-8 flex items-center justify-center">
                   <div class="absolute w-full h-full bg-blue-500/20 rounded-full animate-ping"></div>
                   <div class="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(37,99,235,0.6)] flex items-center justify-center">
                     <div class="w-2 h-2 bg-white rounded-full"></div>
                   </div>
                 </div>`
        })}><Popup>You are here</Popup></Marker>}

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
              <div className="p-1 min-w-[150px]">
                <h3 className="text-sm font-bold border-b pb-1 mb-1">{place.name}</h3>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Type:</span> {place.type === 'hospital' ? '🏥 Hospital' : '💊 Pharmacy'}
                </p>
                <button
                  onClick={() => { setSelectedDestination(place); setFollowUser(false); handleStopNavigation(); }}
                  className="mt-3 w-full bg-blue-600 text-white text-[10px] py-1.5 rounded hover:bg-blue-700 transition-colors uppercase font-bold"
                >
                  {t("Map.ViewOnMap") || "View on Map"}
                </button>
                <button
                  onClick={() => { setSelectedDestination(place); handleStartNavigation(); }}
                  className="mt-1 w-full bg-emerald-600 text-white text-[10px] py-1.5 rounded hover:bg-emerald-700 transition-colors uppercase font-bold flex items-center justify-center gap-1"
                >
                  <Navigation2 size={12} />
                  {t("Map.Navigate") || "Navigate"}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && routeDestination && (
          <Routing
            from={isNavigating && lastRouteUpdatePos ? lastRouteUpdatePos : userLocation}
            to={routeDestination}
            onRouteUpdate={(route) => {
              setCurrentRoute(route);
          //  console.log(route.steps);

              //voiceNav.start(route.steps);
            //  console.log(isNavigating);
              // If we're already navigating and the route just refreshed, 
              // we might need to tell voiceNav about the new steps.
              // We'll only restart it if the structure changed significantly.
              if (isNavigating && route.steps) {
                const enhancedRoute = enhanceRouteSteps(route);
                console.log(enhancedRoute.steps);
                voiceNav.start(enhancedRoute.steps);
                setCurrentStepIndex(voiceNav.currentStepIndex);
              }
            }}
          />
        )}
      </MapContainer>

      {/* Turn-by-Turn UI Overlay - RELOCATED TO BOTTOM */}
      {isNavigating && currentRoute && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-sm backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <ArrowUp size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {currentRoute.steps[currentStepIndex]?.instruction || "Arriving..."}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                    <Navigation2 size={14} fill="currentColor" />
                    <span>{(currentRoute.steps[currentStepIndex]?.distance || 0).toFixed(0)}m</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    Step {currentStepIndex + 1} of {currentRoute.steps.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-xl transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={handleStopNavigation}
                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                title="Exit Navigation"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div
              onClick={testSpeak}
              className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group"
              title="Click to repeat instruction"
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Distance</p>
              <p className="text-lg font-black text-gray-800 dark:text-gray-100">
                {(currentRoute.distance / 1000).toFixed(1)} <span className="text-xs font-medium">km</span>
              </p>
            </div>
            <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
              <p className="text-[10px] text-blue-500 uppercase tracking-widest mb-1 font-bold">Time Left</p>
              <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                {(currentRoute.duration / 60).toFixed(0)} <span className="text-xs font-medium text-blue-600/70">min</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}