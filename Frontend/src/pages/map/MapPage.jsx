import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft, Search, Navigation, MapPin, Navigation2 } from "lucide-react";
import iconpharma from "../../assets/iconpharma.png";
import { useNavigate, useLocation } from "react-router-dom";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";
import Routing from "./Routing";
import { VoiceNavigator } from "./VoiceNavigator";
import { apiSmartPharmacySearch } from "../../api/routing";
import { enhanceRouteSteps } from "./enhanceRouteSteps";
import { apiGetFacilities } from "../../api/hospital";
import NavigationUI from "./NavigationUI";

// Leaflet Icon Fix
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
  }, [position, map, followUser, isNavigating, hasInitialZoom]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isMuted, setIsMuted] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false); // ✅ Add loading state

  const markersRef = useRef({});
  const voiceNavRef = useRef(null);
  const isStartingNavigationRef = useRef(false); // ✅ Prevent double start


  const [routeFetched, setRouteFetched] = useState(false);


  // Initialize voice navigator
  useEffect(() => {
    voiceNavRef.current = new VoiceNavigator({
      proximityThreshold: 60,
      nowThreshold: 15,
      rate: 0.9,
      pitch: 1.0,
    });

    setIsMuted(voiceNavRef.current.isMuted);

    return () => {
      if (voiceNavRef.current) {
        voiceNavRef.current.stop();
      }
    };
  }, []);

  // Accept facility from ResultCard
  useEffect(() => {
    if (location.state?.selectedFacility) {
      const facility = location.state.selectedFacility;
      setSelectedDestination(facility);
      setFollowUser(false);
    }
  }, [location.state]);

  // Fetch facilities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiGetFacilities();
        if (!res.ok) {
          return;
        }
        const data = await res.json();

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
      }
      catch (err) {
        console.error("API Fetch Error:", err);
      }
    };
    fetchData();
  }, []);

  // Live User Tracking
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;

        setUserLocation(prev => {
          if (!prev) return [newLat, newLng];
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

  const startNavigationWithRoute = (route) => {
    if (!route || !route.steps || route.steps.length === 0) {
      console.error("Cannot start navigation: Invalid route");
      return false;
    }

    if (isStartingNavigationRef.current) {
      console.log("Navigation already starting, skipping...");
      return false;
    }

    isStartingNavigationRef.current = true;

    try {
      // Stop any existing navigation first
      if (voiceNavRef.current) {
        voiceNavRef.current.stop();
      }

      // ALWAYS enhance the route
      const enhancedRoute = enhanceRouteSteps(route);
      // console.log("Starting navigation with enhanced route:", enhancedRoute);
      // console.log("First step instruction:", enhancedRoute.steps[0]?.fullInstruction);

      // Start voice navigation
      if (voiceNavRef.current) {
        voiceNavRef.current.start(enhancedRoute.steps);
      }

      // Update state
      setCurrentRoute(enhancedRoute);
      setCurrentStepIndex(0);
      setIsNavigating(true);
      setFollowUser(true);
      setLastRouteUpdatePos(userLocation);

      return true;
    } catch (error) {
      console.error("Error starting navigation:", error);
      return false;
    } finally {
      setTimeout(() => {
        isStartingNavigationRef.current = false;
      }, 1000);
    }
  };
  const handleRouteUpdate = useCallback((route) => {
    console.log("Route received from Routing component:", route);
    console.log("Route steps count:", route.steps?.length);

    if (route && route.steps && route.steps.length > 0) {
      if (isNavigating) {
        console.log("Starting voice navigation with received route");
        startNavigationWithRoute(route);
      } else {
        console.log("Storing route for later use");
        setCurrentRoute(route);
      }
    } else {
      console.error("Invalid route received - no steps!");
    }
  }, [isNavigating, startNavigationWithRoute]);
  // ✅ FIXED: Navigation updates
  useEffect(() => {
    if (!isNavigating || !userLocation || !voiceNavRef.current) return;
    if (!currentRoute || !currentRoute.steps) return;

    // Update voice navigator with current position
    voiceNavRef.current.update(userLocation[0], userLocation[1]);

    // Sync step index
    const voiceStepIndex = voiceNavRef.current.currentStepIndex;
    if (voiceStepIndex !== currentStepIndex && voiceStepIndex >= 0) {
      setCurrentStepIndex(voiceStepIndex);
    }

    // Check if navigation completed
    if (voiceStepIndex >= currentRoute.steps.length - 1) {
      const lastStep = currentRoute.steps[voiceStepIndex];
      if (lastStep?.type === 'arrive') {
        console.log("Arrived at destination!");
        setTimeout(() => {
          handleStopNavigation();
        }, 5000);
      }
    }

    // Refresh route if moved significantly
    if (lastRouteUpdatePos) {
      const distMoved = getDistanceFromLatLonInMeters(
        userLocation[0], userLocation[1],
        lastRouteUpdatePos[0], lastRouteUpdatePos[1]
      );
      if (distMoved > 30) {
        setLastRouteUpdatePos(userLocation);
      }
    } else {
      setLastRouteUpdatePos(userLocation);
    }
  }, [userLocation, isNavigating, currentRoute, currentStepIndex, lastRouteUpdatePos]);

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

  const filteredPlaces = searchQuery.trim()
    ? facilities.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const routeDestination = selectedDestination
    ? [selectedDestination.lat, selectedDestination.lng]
    : null;

  // ✅ FIXED: Single function to start navigation with enhanced route

  // Generate a unique key for the route
  const routeKey = useMemo(() => {
    if (!userLocation || !routeDestination) return null;
    return `${userLocation[0].toFixed(6)}-${userLocation[1].toFixed(6)}|${routeDestination[0].toFixed(6)}-${routeDestination[1].toFixed(6)}`;
  }, [userLocation, routeDestination]);

  // Reset fetched flag when destination changes
  useEffect(() => {
    setRouteFetched(false);
  }, [selectedDestination]);

  // ✅ FIXED: Handle navigation start from button click
  const handleStartNavigation = (place) => {
    if (!userLocation) {
      alert("Please enable location services");
      return;
    }
    setSelectedDestination(place);
    //console.log("Selected destination:", selectedDestination);
    if (!place) {
      alert("Please select a destination first");
      return;
    }

    // If we already have a route, use it
    if (currentRoute && currentRoute.steps) {
      console.log("Using existing route for navigation");
      startNavigationWithRoute(currentRoute);
    } else {
      // Route will be provided by Routing component's onRouteUpdate
      console.log("Waiting for route to be calculated...");
      setIsNavigating(true); // This will trigger the Routing component
      setFollowUser(true);
      setLastRouteUpdatePos(userLocation);
    }
  };

  const handleStopNavigation = () => {
    console.log("Stopping navigation...");
    setIsNavigating(false);
    if (voiceNavRef.current) {
      voiceNavRef.current.stop();
    }
    // Don't clear currentRoute immediately - keep it for potential restart
    // setCurrentRoute(null);
    setCurrentStepIndex(0);
    setLastRouteUpdatePos(null);
    isStartingNavigationRef.current = false;
  };

  const handleDrugSearch = async () => {
    if (!searchQuery.trim() || !userLocation) return;
    setLoading(true);
    try {
      const data = await apiSmartPharmacySearch(userLocation, searchQuery);

      if (data && data.success) {
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

        // Start navigation with the route from API
        if (data.route) {
          startNavigationWithRoute(data.route);
        }

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
    if (voiceNavRef.current) {
      const newMute = voiceNavRef.current.toggleMute();
      setIsMuted(newMute);
    }
  };


  const repeatCurrentInstruction = () => {
    if (voiceNavRef.current && isNavigating) {
      voiceNavRef.current.repeatCurrentInstruction();
    }
  };

  return (
    <div className="relative w-screen h-screen">
      {/* Search UI */}
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-48 overflow-y-auto z-[1001]">
              {filteredPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => {
                    setSelectedDestination(place);
                    setFollowUser(false);
                    setSearchQuery("");
                    handleStopNavigation();
                  }}
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
            <TileLayer url="https://medfinder.com/tiles/{z}/{x}/{y}.png" />

            {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
        </LayersControl>

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

        {userLocation && (
          <Marker position={userLocation} icon={new L.DivIcon({
            className: 'custom-user-icon',
            html: `<div class="relative w-8 h-8 flex items-center justify-center">
                     <div class="absolute w-full h-full bg-blue-500/20 rounded-full animate-ping"></div>
                     <div class="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(37,99,235,0.6)] flex items-center justify-center">
                       <div class="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                   </div>`
          })}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {facilities.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={place.type === 'pharmacy' ? pharmacyIcon : new L.Icon.Default()}
          >
            <Tooltip direction="top" offset={[0, -32]} opacity={1}>
              <span className="font-bold">{place.name}</span>
            </Tooltip>

            <Popup ref={(el) => {
              if (el) markersRef.current[place.id] = el;
            }}>
              <div className="p-1 min-w-[150px]">
                <h3 className="text-sm font-bold border-b pb-1 mb-1">{place.name}</h3>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Type:</span> {place.type === 'hospital' ? '🏥 Hospital' : '💊 Pharmacy'}
                </p>
                <button
                  onClick={() => {
                    setSelectedDestination(place);
                    setFollowUser(false);
                    handleStopNavigation();
                    markersRef.current[place.id]?.close();
                  }}
                  className="mt-3 w-full bg-blue-600 text-white text-[10px] py-1.5 rounded hover:bg-blue-700 transition-colors uppercase font-bold"
                >
                  {t("Map.ViewOnMap") || "View on Map"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedDestination(place);
                    markersRef.current[place.id]?.close();
                    setTimeout(() => {
                      handleStartNavigation(place);
                    }, 100); // ✅ Call start navigation
                  }}
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
            key={routeKey}  // ✅ Key changes only when route actually changes
            from={isNavigating && lastRouteUpdatePos ? lastRouteUpdatePos : userLocation}
            to={routeDestination}
            onRouteUpdate={(route) => {
              setRouteFetched(true);  // ✅ Mark as fetched
              handleRouteUpdate(route);
            }}
          />
        )}
      </MapContainer>

      {/* ✅ Navigation UI - Shows when navigating AND route exists */}
      {isNavigating && currentRoute && currentRoute.steps && currentRoute.steps.length > 0 && (
        <NavigationUI
          currentRoute={currentRoute}
          currentStepIndex={currentStepIndex}
          isMuted={isMuted}
          toggleMute={toggleMute}
          handleStopNavigation={handleStopNavigation}
          testSpeak={repeatCurrentInstruction}
        />
      )}
    </div>
  );
}