import React, { useEffect, useState, useRef } from "react";
import { useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { apiFetchRoute } from "../../api/routing";
import Loading from "../../component/SupportiveComponent/Loading";

export default function Routing({ key, from, to, onRouteUpdate }) {
  const map = useMap();
  const [routeData, setRouteData] = useState(null);
  const hasFetchedRef = useRef(false);
  const lastFromToRef = useRef(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!from || !to) return;

    // Create stable key from coordinates
    const fromKey = `${from[0]?.toFixed(6)},${from[1]?.toFixed(6)}`;
    const toKey = `${to[0]?.toFixed(6)},${to[1]?.toFixed(6)}`;
    const currentFromTo = `${fromKey}|${toKey}`;

    // Skip if same route already fetched
    if (lastFromToRef.current === currentFromTo && hasFetchedRef.current) {
      //console.log("Same route, skipping fetch");
      return;
    }

    lastFromToRef.current = currentFromTo;
    hasFetchedRef.current = false;

    const ac = new AbortController();

    const fetchRoute = async () => {

      try {
        setLoading(true);


        const data = await apiFetchRoute(from, to, { signal: ac.signal });

        if (data && data.points) {
          // console.log("Route received, steps:", data.steps?.length || 0);

          // Ensure steps array exists
          if (!data.steps || data.steps.length === 0) {
            //console.warn("API returned no steps, generating fallback steps");
            data.steps = generateFallbackSteps(data.points);
          }
          //console.log("1", "userLocation");
          setRouteData(data);
          hasFetchedRef.current = true;

          if (onRouteUpdate) {
            onRouteUpdate(data);
          }

          // Only fit bounds if not already zoomed in
          const currentZoom = map.getZoom();
          if (currentZoom < 14) {
            const bounds = L.latLngBounds(data.points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          }
        }
      } catch (error) {
        setLoading(false);
        if (error.name !== 'AbortError') {
          console.error("Error fetching route:", error);
        }
        hasFetchedRef.current = false;
      } finally {

        setLoading(false);
      }
    };

    fetchRoute();
    return () => {
      ac.abort();
    };
  },
    [
      from?.[0]?.toFixed(6),
      from?.[1]?.toFixed(6),
      to?.[0]?.toFixed(6),
      to?.[1]?.toFixed(6),
      map,

    ]);

  // Helper: Generate fallback steps
  const generateFallbackSteps = (points) => {
    if (!points || points.length < 2) return [];

    // Accept points as either [lat, lng] arrays or {lat, lng} objects
    const toLatLng = (p) => {
      if (!p) return { lat: null, lng: null };
      if (Array.isArray(p)) return { lat: Number(p[0]), lng: Number(p[1]) };
      if (typeof p.lat === 'number' && typeof p.lng === 'number') return { lat: p.lat, lng: p.lng };
      // Support possible GeoJSON-like object
      if (p.coordinates && Array.isArray(p.coordinates)) return { lat: Number(p.coordinates[1]), lng: Number(p.coordinates[0]) };
      return { lat: null, lng: null };
    };

    const steps = [];
    const first = toLatLng(points[0]);
    steps.push({ type: 'depart', lat: first.lat, lng: first.lng, distance: 0, instruction: "Start your journey" });

    for (let i = 1; i < points.length - 1; i++) {
      const p = toLatLng(points[i]);
      steps.push({ type: 'turn', lat: p.lat, lng: p.lng, distance: 100, instruction: "Continue straight", turnDirection: "straight" });
    }

    const last = toLatLng(points[points.length - 1]);
    steps.push({ type: 'arrive', lat: last.lat, lng: last.lng, distance: 0, instruction: "You have arrived at your destination" });

    return steps;
  };
  //console.log("1", routeData);
  if (!routeData && loading) return null;
  if (!routeData) return null;
  return (
    <>
      <Polyline
        positions={routeData.points}
        pathOptions={{ color: "#2563EB", weight: 8, opacity: 0.4, lineJoin: 'round' }}
      />
      <Polyline
        positions={routeData.points}
        pathOptions={{ color: "#3B82F6", weight: 4, opacity: 1, lineJoin: 'round' }}
      />
    </>
  );
}