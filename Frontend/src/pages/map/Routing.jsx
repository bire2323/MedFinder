import React, { useEffect, useState, useRef } from "react";
import { useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { apiFetchRoute } from "../../api/routing";

export default function Routing({ from, to, onRouteUpdate, onRouteLoading }) {
  const map = useMap();
  const [routeData, setRouteData] = useState(null);
  const hasFetchedRef = useRef(false);
  const lastFromToRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    // Create stable key from coordinates
    const fromKey = `${from[0]?.toFixed(6)},${from[1]?.toFixed(6)}`;
    const toKey = `${to[0]?.toFixed(6)},${to[1]?.toFixed(6)}`;
    const currentFromTo = `${fromKey}|${toKey}`;

    // Skip if same route already fetched
    if (lastFromToRef.current === currentFromTo && hasFetchedRef.current) {
      console.log("Same route, skipping fetch");
      return;
    }

    lastFromToRef.current = currentFromTo;
    hasFetchedRef.current = false;

    const ac = new AbortController();

    const fetchRoute = async () => {
      try {
        if (onRouteLoading) onRouteLoading(true);
        console.log("Fetching new route from backend...", { from, to });

        const data = await apiFetchRoute(from, to, { signal: ac.signal });

        if (data && data.points) {
          console.log("Route received, steps:", data.steps?.length || 0);

          // Ensure steps array exists
          if (!data.steps || data.steps.length === 0) {
            console.warn("API returned no steps, generating fallback steps");
            data.steps = generateFallbackSteps(data.points);
          }

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
        if (error.name !== 'AbortError') {
          console.error("Error fetching route:", error);
        }
        hasFetchedRef.current = false;
      } finally {
        if (onRouteLoading) onRouteLoading(false);
      }
    };

    fetchRoute();
    return () => {
      ac.abort();
    };
  }, [
    from?.[0]?.toFixed(6),
    from?.[1]?.toFixed(6),
    to?.[0]?.toFixed(6),
    to?.[1]?.toFixed(6),
    map,
    onRouteUpdate,
    onRouteLoading
  ]);

  // Helper: Generate fallback steps
  const generateFallbackSteps = (points) => {
    if (!points || points.length < 2) return [];

    const steps = [];
    steps.push({
      type: 'depart',
      lat: points[0].lat,
      lng: points[0].lng,
      distance: 0,
      instruction: "Start your journey"
    });

    for (let i = 1; i < points.length - 1; i++) {
      steps.push({
        type: 'turn',
        lat: points[i].lat,
        lng: points[i].lng,
        distance: 100,
        instruction: "Continue straight",
        turnDirection: "straight"
      });
    }

    const lastPoint = points[points.length - 1];
    steps.push({
      type: 'arrive',
      lat: lastPoint.lat,
      lng: lastPoint.lng,
      distance: 0,
      instruction: "You have arrived at your destination"
    });

    return steps;
  };

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