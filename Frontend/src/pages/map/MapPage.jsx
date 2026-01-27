import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft } from "lucide-react";
import iconpharma from "../../assets/iconpharma.png";
import { useNavigate } from "react-router-dom";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";

import { LayersControl, Polyline } from "react-leaflet";
import Routing from "./routing";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const locations = [
  {
    id: 1,
    name: "Pharmacy A",
    lat: 12.5931201,
    lng: 37.4501201,
  },
  {
    id: 2,
    name: "Hospital B",
    lat: 12.5931201,
    lng: 37.4472302,
  },
];
const pharmacyIcon = L.icon({
  iconUrl: iconpharma,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);

  const { BaseLayer } = LayersControl;

  const [places, setPlaces] = useState(locations);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (loc) => {
        console.log(loc);
        setUserLocation([loc.coords.latitude, loc.coords.longitude]);
      },
      () => {
        alert("Location permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const sortedPharmacies =
    userLocation &&
    locations
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

  console.log(sortedPharmacies);
  return (
    <div className="relative w-screen h-screen">
      <button
        className="bg-gray-400 p-2 w-fit absolute bottom-[50%] left-0 cursor-pointer z-1000"
        onClick={() => navigate("/")}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <MapContainer
        center={userLocation || [12.5903939, 37.4501203]}
        zoom={13}
        className="h-screen z-40"
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
        {userLocation && <RecenterMap position={userLocation} />}

        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={pharmacyIcon}
          >
            <Popup>
              <b>{place.name}</b>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <>
            {/* <Polyline
              positions={[userLocation, [12.5931201, 37.4472302]]}
              color="blue"
            /> */}
            <Routing from={userLocation} to={[12.5931201, 37.4472302]} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
