import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { MapPin, Navigation, ArrowLeft, ArrowRight } from "lucide-react";
import { useRegistrationStore } from "../../store/registrationStore";
import { useActiveRegions, useCitiesByRegion } from "../../hooks/useLocationData";
import SelectInput from "../../components/common/SelectInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import WorkingHoursPicker from "../shared/WorkingHoursPicker";

export default function Step2Location() {
  const navigate = useNavigate();
  const { type } = useParams();

  const { formData: storeFormData, syncFormDataFromLocal, validateStep2, registrationType, errors: storeErrors } =
    useRegistrationStore();

  const { regions, loading: regionsLoading, error: regionsError } = useActiveRegions();

  const regionOptions = useMemo(
    () => regions.map((r) => ({ value: String(r.id), label: r.name_en })),
    [regions]
  );

  const { register, handleSubmit, reset, watch, setValue, formState, control } = useForm({
    defaultValues: {
      region_id: storeFormData.region_id ? String(storeFormData.region_id) : "",
      city_id: storeFormData.city_id ? String(storeFormData.city_id) : "",
      kebele: storeFormData.kebele || "",
      latitude: storeFormData.latitude || "",
      longitude: storeFormData.longitude || "",
      address_type: storeFormData.address_type || "main",
      contact_phone: storeFormData.contact_phone || "",
      contact_email: storeFormData.contact_email || "",
      workingHour: storeFormData.workingHour || {},
    },
  });

  const regionId = watch("region_id");
  const prevRegionIdRef = useRef(null);
  const { cities, loading: citiesLoading, error: citiesError } = useCitiesByRegion(regionId ? Number(regionId) : null);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.name_en })),
    [cities]
  );

  useEffect(() => {
    reset({
      region_id: storeFormData.region_id ? String(storeFormData.region_id) : "",
      city_id: storeFormData.city_id ? String(storeFormData.city_id) : "",
      kebele: storeFormData.kebele || "",
      latitude: storeFormData.latitude || "",
      longitude: storeFormData.longitude || "",
      address_type: storeFormData.address_type || "main",
      contact_phone: storeFormData.contact_phone || "",
      contact_email: storeFormData.contact_email || "",
      workingHour: storeFormData.workingHour || {},
    });
  }, [reset, storeFormData]);

  useEffect(() => {
    if (prevRegionIdRef.current === null) {
      prevRegionIdRef.current = regionId;
      return;
    }
    if (prevRegionIdRef.current !== regionId) {
      setValue("city_id", "");
    }
    prevRegionIdRef.current = regionId;
  }, [regionId, setValue]);

  const onGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue("latitude", pos.coords.latitude.toFixed(6), { shouldValidate: true });
      setValue("longitude", pos.coords.longitude.toFixed(6), { shouldValidate: true });
    });
  };

  const onSubmit = handleSubmit((values) => {
    const normalized = {
      region_id: values.region_id ? Number(values.region_id) : "",
      city_id: values.city_id ? Number(values.city_id) : "",
      kebele: values.kebele || "",
      latitude: values.latitude || "",
      longitude: values.longitude || "",
      address_type: values.address_type || "main",
      contact_phone: values.contact_phone || "",
      contact_email: values.contact_email || "",
      workingHour: values.workingHour || {},
    };

    syncFormDataFromLocal(normalized);
    if (validateStep2()) {
      navigate(`/register/${type}/verification-info`);
    }
  });

  const fieldError = (name) => formState.errors?.[name]?.message || storeErrors?.[name];

  return (
    <form onSubmit={onSubmit} className="p-6 md:p-8">
      <div className="space-y-6">
        {regionsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{regionsError}</div>
        ) : null}
        {citiesError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{citiesError}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectInput
            label="Region"
            name="region_id"
            register={register}
            required="Region is required"
            placeholder={regionsLoading ? "Loading regions..." : "Select a region"}
            options={regionOptions}
            disabled={regionsLoading}
            error={fieldError("region_id")}
          />

          <SelectInput
            label="City"
            name="city_id"
            register={register}
            required="City is required"
            placeholder={
              !regionId ? "Select a region first" : citiesLoading ? "Loading cities..." : cityOptions.length ? "Select a city" : "No cities available"
            }
            options={cityOptions}
            disabled={!regionId || citiesLoading || cityOptions.length === 0}
            error={fieldError("city_id")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Kebele</label>
            <input
              type="text"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${fieldError("kebele") ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              {...register("kebele", { required: "Kebele is required" })}
            />
            {fieldError("kebele") ? <p className="text-xs text-red-500">{fieldError("kebele")}</p> : null}
          </div>

          <SelectInput
            label="Address Type"
            name="address_type"
            register={register}
            required="Address type is required"
            options={[
              { value: "main", label: "Main" },
              { value: "branch", label: "Branch" },
              { value: "other", label: "Other" },
            ]}
            placeholder="Select address type"
            error={fieldError("address_type")}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Address discription</label>
            <input
              type="text"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${fieldError("description_en") ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              {...register("description_en")}
            />
            {fieldError("description_en") ? <p className="text-xs text-red-500">{fieldError("description_en")}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Address Description (Amharic)</label>
            <input
              type="text"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${fieldError("description_am") ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              {...register("description_am")}
            />
            {fieldError("description_am") ? <p className="text-xs text-red-500">{fieldError("description_am")}</p> : null}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
              <MapPin size={16} className="text-blue-500" />
              GPS Coordinates
            </div>
            <button
              type="button"
              onClick={onGetLocation}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={!navigator.geolocation}
            >
              <Navigation size={14} />
              Use my location
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Latitude</label>
              <input
                type="text"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${fieldError("latitude") ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                {...register("latitude", { required: "Latitude is required" })}
              />
              {fieldError("latitude") ? <p className="text-xs text-red-500">{fieldError("latitude")}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Longitude</label>
              <input
                type="text"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${fieldError("longitude") ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                {...register("longitude", { required: "Longitude is required" })}
              />
              {fieldError("longitude") ? <p className="text-xs text-red-500">{fieldError("longitude")}</p> : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Contact Phone</label>
            <input
              type="tel"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${fieldError("contact_phone") ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              {...register("contact_phone", { required: registrationType === "hospital" ? "Phone is required" : false })}
            />
            {fieldError("contact_phone") ? <p className="text-xs text-red-500">{fieldError("contact_phone")}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Contact Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              {...register("contact_email")}
            />
          </div>
        </div>

        {registrationType === "hospital" ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Working Hours</label>
            <Controller
              control={control}
              name="workingHour"
              rules={{
                validate: (value) => {
                  if (!value || typeof value !== "object") return "Working hours are required";
                  const hasAny = Object.values(value).some((hours) => Array.isArray(hours) && hours.length > 0);
                  return hasAny || "Working hours are required";
                },
              }}
              render={({ field }) => <WorkingHoursPicker value={field.value} onChange={field.onChange} />}
            />
            {fieldError("workingHour") ? <p className="text-xs text-red-500">{fieldError("workingHour")}</p> : null}
          </div>
        ) : null}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-3 text-sm font-bold text-white hover:from-blue-700 hover:to-emerald-700 disabled:opacity-60"
          >
            {formState.isSubmitting ? <LoadingSpinner size={16} className="border-white" /> : null}
            Next <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
