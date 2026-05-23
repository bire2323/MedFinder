/**
 * LocationSelector Component
 * Dependent dropdowns for selecting region and city
 * Used in hospital and pharmacy registration forms
 */
import React, { useState, useEffect } from "react";
import { useActiveRegions, useCitiesByRegion } from "../../hooks/useLocationData";

export function LocationSelector({ onLocationChange, initialRegionId = null, initialCityId = null }) {
  const [selectedRegion, setSelectedRegion] = useState(initialRegionId || "");
  const [selectedCity, setSelectedCity] = useState(initialCityId || "");

  const { regions, loading: loadingRegions, error: errorRegions } = useActiveRegions();
  const { cities, loading: loadingCities } = useCitiesByRegion(selectedRegion);

  // Reset city when region changes
  useEffect(() => {
    setSelectedCity("");
  }, [selectedRegion]);

  // Notify parent of changes
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange({
        regionId: selectedRegion ? parseInt(selectedRegion) : null,
        cityId: selectedCity ? parseInt(selectedCity) : null,
      });
    }
  }, [selectedRegion, selectedCity, onLocationChange]);

  return (
    <div className="space-y-4">
      {/* Region Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Region
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={loadingRegions}
        >
          <option value="">
            {loadingRegions ? "Loading regions..." : "Select Region"}
          </option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name_en} ({region.name_am})
            </option>
          ))}
        </select>
        {errorRegions && <p className="mt-1 text-sm text-red-600">{errorRegions}</p>}
      </div>

      {/* City Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          City / Sub-City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:bg-gray-100"
          disabled={!selectedRegion || loadingCities}
        >
          <option value="">
            {!selectedRegion
              ? "Select Region First"
              : loadingCities
                ? "Loading cities..."
                : cities.length === 0
                  ? "No cities available"
                  : "Select City"}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name_en} ({city.name_am})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default LocationSelector;
