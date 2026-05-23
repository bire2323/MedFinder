/**
 * useLocationData Hook
 * Manages location data fetching and state for regions and cities
 */
import { useState, useEffect, useCallback } from "react";
import locationApi from "../api/locationApi";
import { normalizePaginated, unwrapData } from "../utils/apiResponse";

export function useActiveRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await locationApi.getRegions();
      setRegions(unwrapData(response) || []);
    } catch (err) {
      setError(err.message || "Error fetching regions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, loading, error, refetch: fetchRegions };
}

export function useCitiesByRegion(regionId) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCities = useCallback(async () => {
    if (!regionId) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await locationApi.getCitiesByRegion(regionId);
      setCities(unwrapData(response) || []);
    } catch (err) {
      setError(err.message || "Error fetching cities");
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return { cities, loading, error, refetch: fetchCities };
}

// Admin hooks
export function useAdminRegions(page = 1, perPage = 15, search = "") {
  const [regions, setRegions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await locationApi.admin.getRegions({ page, per_page: perPage, search });
      const { items, pagination: pg } = normalizePaginated(response);
      setRegions(items);
      setPagination(pg);
    } catch (err) {
      setError(err.message || "Error fetching regions");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, pagination, loading, error, refetch: fetchRegions };
}

export function useAdminCities(page = 1, perPage = 15, search = "", regionId = null) {
  const [cities, setCities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await locationApi.admin.getCities({
        page,
        per_page: perPage,
        search,
        ...(regionId ? { region_id: regionId } : {}),
      });
      const { items, pagination: pg } = normalizePaginated(response);
      setCities(items);
      setPagination(pg);
    } catch (err) {
      setError(err.message || "Error fetching cities");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, regionId]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return { cities, pagination, loading, error, refetch: fetchCities };
}

export default {
  useActiveRegions,
  useCitiesByRegion,
  useAdminRegions,
  useAdminCities,
};
