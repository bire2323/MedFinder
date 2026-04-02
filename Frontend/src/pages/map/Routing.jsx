import React, { useEffect, useState } from "react";
import { useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { apiFetchRoute } from "../../api/routing";

export default function Routing({ from, to, onRouteUpdate }) {
  const map = useMap();
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    if (!from || !to) return;

    const ac = new AbortController();

    const fetchRoute = async () => {
      try {
        console.log("Fetching new route from backend...");
        const data = await apiFetchRoute(from, to, { signal: ac.signal });

        if (data && data.points) {
          setRouteData(data);
          
          if (onRouteUpdate) {
            onRouteUpdate(data);
          }

          // Fit bounds only on initial load or if destination changed
          // We don't want to snap the zoom while user is actively tracking
          // if (!routeData || routeData.to !== to.join(',')) {
          //   const bounds = L.latLngBounds(data.points);
          //   map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          // }
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
    return () => ac.abort();
  }, [from[0], from[1], to[0], to[1], map]);

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