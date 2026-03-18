import { useEffect, useRef } from "react";
import { MapPin, Navigation, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  hospitalInfo: any;
}

export default function MapView({ hospitalInfo }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !hospitalInfo?.location?.coordinates) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const { lat, lng } = hospitalInfo.location.coordinates;

      // Create map
      const map = L.map(mapRef.current).setView([lat, lng], 15);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon
      const hospitalIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          background-color: #2563eb;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 20px;
          ">🏥</div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // Add marker
      L.marker([lat, lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(
          `<div style="text-align: center;">
            <strong>${hospitalInfo.name}</strong><br/>
            ${hospitalInfo.location.address}
          </div>`
        )
        .openPopup();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [hospitalInfo]);

  const handleGetDirections = () => {
    if (hospitalInfo?.location?.coordinates) {
      const { lat, lng } = hospitalInfo.location.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    }
  };

  if (!hospitalInfo) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading hospital information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hospital Location</CardTitle>
          <CardDescription>Interactive map showing your hospital's location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={mapRef}
            className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p>
                      {hospitalInfo.location?.address}
                      {hospitalInfo.location?.city && `, ${hospitalInfo.location.city}`}
                      {hospitalInfo.location?.state && `, ${hospitalInfo.location.state}`}
                      {hospitalInfo.location?.zipCode && ` ${hospitalInfo.location.zipCode}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                    <p>{hospitalInfo.phoneNumber}</p>
                    <p className="text-sm">
                      Emergency: {hospitalInfo.emergencyContact}
                    </p>
                  </div>
                </div>

                {hospitalInfo.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="size-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                      <a
                        href={hospitalInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {hospitalInfo.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Coordinates</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Lat: {hospitalInfo.location?.coordinates?.lat.toFixed(4)}
                    </Badge>
                    <Badge variant="secondary">
                      Lng: {hospitalInfo.location?.coordinates?.lng.toFixed(4)}
                    </Badge>
                  </div>
                </div>

                <Button onClick={handleGetDirections} className="w-full">
                  <Navigation className="size-4 mr-2" />
                  Get Directions
                </Button>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Navigation Support
                  </p>
                  <p className="text-sm">
                    Patients can easily navigate to your hospital using this interactive map and
                    get turn-by-turn directions from their current location.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Your hospital's working schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hospitalInfo.workingHours &&
              Object.entries(hospitalInfo.workingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="capitalize">{day}</span>
                  <Badge variant="outline">{hours as string}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
