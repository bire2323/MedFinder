import { useState } from "react";
import { apiFetch, ensureCsrfCookie } from "../api/client";
import { validateProfile } from "../utils/settingsValidation";

const useProfileUpdate = (type, id) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (data, files = {}) => {
    // console.log("data passed to userprofileupdate", data);
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Validate
    const validation = validateProfile(data, type);
    // console.log(validation);
    if (!validation.isValid) {
      // console.log("validation error");
      setError(validation.errors);
      setLoading(false);
      return false;
    } else if (data.approved_by === null) {
      setError("Your profile is not approved yet. Wait the administrator review.");
      setLoading(false);
      return false;
    }

    try {
      // Create FormData for mixed data (JSON + Files)
      const formData = new FormData();

      // Process each field in data
      Object.entries(data).forEach(([key, value]) => {
        // Skip undefined or null values
        if (value === undefined || value === null) {
          return;
        }

        // Skip file-related fields that are URLs (not actual files)
        if ((key === 'logo' || key === 'pharmacy_license_upload') &&
          typeof value === 'string' &&
          (value.startsWith('http') || value.startsWith('/storage'))) {
          return;
        }

        // Handle working_hour specifically
        if (key === 'working_hour') {
          // If working_hour is an object, stringify it cleanly
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Clean empty arrays from working_hour
            const cleanedWorkingHour = {};
            Object.keys(value).forEach(day => {
              if (value[day] && Array.isArray(value[day]) && value[day].length > 0) {
                cleanedWorkingHour[day] = value[day];
              }
            });
            formData.append(key, JSON.stringify(cleanedWorkingHour));
          }
          // If it's already a string, validate it's proper JSON
          else if (typeof value === 'string') {
            try {
              // Validate it's proper JSON
              JSON.parse(value);
              formData.append(key, value);
            } catch (e) {
              // If invalid JSON, treat as empty object
              formData.append(key, JSON.stringify({}));
            }
          }
          return;
        }

        // Handle addresses (array)
        if (key === 'addresses') {
          if (Array.isArray(value)) {
            // Clean up addresses data
            const cleanedAddresses = value.map(addr => {
              const cleanAddr = { ...addr };
              // Remove fields that shouldn't be updated
              delete cleanAddr.id;
              delete cleanAddr.addressable_id;
              delete cleanAddr.addressable_type;
              delete cleanAddr.created_at;
              delete cleanAddr.updated_at;
              delete cleanAddr.deleted_at;
              return cleanAddr;
            });
            formData.append(key, JSON.stringify(cleanedAddresses));
          }
          return;
        }

        // Handle other objects (like is_full_time_service)
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // For boolean-like objects, convert to actual boolean
          if (key === 'is_full_time_service') {
            const boolValue = value === true || value === 'true' || value === 1 || value === '1';
            formData.append(key, boolValue ? '1' : '0');
          } else {
            formData.append(key, JSON.stringify(value));
          }
        }
        // Handle regular fields
        else {
          // Special handling for boolean fields
          if (key === 'is_full_time_service') {
            const boolValue = value === true || value === 'true' || value === 1 || value === '1';
            formData.append(key, boolValue ? '1' : '0');
          } else {
            formData.append(key, value);
          }
        }
      });

      // Append files
      Object.entries(files).forEach(([key, file]) => {
        if (file instanceof File) {
          formData.append(key, file);
        }
      });

      // Spoof POST with _method for Laravel
      formData.append("_method", "POST");

      // Determine endpoint based on type
      const endpoint = type === "hospital"
        ? `/api/hospital/profile/${id}`
        : `/api/pharmacy/profile/${id}`;

      await ensureCsrfCookie();
      // console.log(formData);
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type - let browser set it with boundary
          'Accept': 'application/json',
        },
      });

      if (response.success) {
        setSuccess(true);
        return true;
      } else {
        setError(response.message || "Failed to update profile.");
        return false;
      }
    } catch (err) {
      console.error("Update error:", err);

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setError(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error, success };
};

export default useProfileUpdate;