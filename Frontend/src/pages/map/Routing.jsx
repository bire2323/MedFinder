import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

export default function Routing({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(...from), L.latLng(...to)],
      lineOptions: {
        styles: [{ color: "blue", weight: 2 }],
      },
      show: true,
      routeWhileDragging: false,
      addWaypoints: false,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, from, to]);

  return null;
}
