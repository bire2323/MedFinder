import React, { useState, useEffect, memo } from 'react';
import { useRegistrationStore } from '../../store/registrationStore';
import { MapPin, Phone, Navigation, ArrowLeft, ArrowRight, Globe, Building, Map, Timer } from 'lucide-react';
import handleKeyDown from '../../hooks/handleKeyDown';

const ETHIOPIAN_REGIONS_EN = [
  { value: '', label: 'Select Region' },
  { value: 'addis_ababa', label: 'Addis Ababa' },
  { value: 'afar', label: 'Afar' },
  { value: 'amhara', label: 'Amhara' },
  { value: 'benishangul_gumuz', label: 'Benishangul-Gumuz' },
  { value: 'dire_dawa', label: 'Dire Dawa' },
  { value: 'gambela', label: 'Gambela' },
  { value: 'harari', label: 'Harari' },
  { value: 'oromia', label: 'Oromia' },
  { value: 'sidama', label: 'Sidama' },
  { value: 'snnpr', label: 'SNNPR' },
  { value: 'somali', label: 'Somali' },
  { value: 'south_west', label: 'South West Ethiopia' },
  { value: 'tigray', label: 'Tigray' },
];

const ETHIOPIAN_REGIONS_AM = [
  { value: '', label: 'ክልል ይምረጡ' },
  { value: 'addis_ababa', label: 'አዲስ አበባ' },
  { value: 'afar', label: 'አፋር' },
  { value: 'amhara', label: 'አማራ' },
  { value: 'benishangul_gumuz', label: 'ቤንሻንጉል ጉሙዝ' },
  { value: 'dire_dawa', label: 'ድሬዳዋ' },
  { value: 'gambela', label: 'ጋምቤላ' },
  { value: 'harari', label: 'ሐረሪ' },
  { value: 'oromia', label: 'ኦሮሚያ' },
  { value: 'sidama', label: 'ሲዳማ' },
  { value: 'snnpr', label: 'ደቡብ ብሔራዊ ህዝቦች' },
  { value: 'somali', label: 'ሶማሌ' },
  { value: 'south_west', label: 'ደቡብ ምዕራብ ኢትዮጵያ' },
  { value: 'tigray', label: 'ትግራይ' },
];

// Memoized InputField – moved outside to prevent recreation on every render
const InputField = memo(({
  id, label, icon: Icon, type = 'text', placeholder, required = false,
  value, error, hint, dir = 'ltr', onChange
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
      <Icon size={16} className="text-blue-500" />
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      onKeyDown={handleKeyDown}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      dir={dir}
      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'
        }`}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && <p id={`${id}-error`} className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
));

const Step2Location = () => {
  const {
    formData: storeFormData,
    errors,
    syncFormDataFromLocal,
    nextStep,
    prevStep,
    validateStep2,
    registrationType,
  } = useRegistrationStore();

  const [localData, setLocalData] = useState({
    region_en: '',
    region_am: '',
    zone_en: '',
    zone_am: '',
    subCity_en: '',
    subCity_am: '',
    kebele: '',
    detailedAddress_en: '',
    detailedAddress_am: '',
    latitude: '',
    longitude: '',
    workingHour: '',
    mainContactPhone: '',
    alternatePhone: '',
  });

  useEffect(() => {
    setLocalData({
      region_en: storeFormData.region_en || '',
      region_am: storeFormData.region_am || '',
      zone_en: storeFormData.zone_en || '',
      zone_am: storeFormData.zone_am || '',
      subCity_en: storeFormData.subCity_en || '',
      subCity_am: storeFormData.subCity_am || '',
      kebele: storeFormData.kebele || '',
      detailedAddress: storeFormData.detailedAddress_en || '',
      detailedAddress: storeFormData.detailedAddress_am || '',
      latitude: storeFormData.latitude || '',
      longitude: storeFormData.longitude || '',
      workingHour: storeFormData.workingHour || '',
      mainContactPhone: storeFormData.mainContactPhone || '',
      alternatePhone: storeFormData.alternatePhone || '',
    });
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    syncFormDataFromLocal(localData);
    if (validateStep2()) nextStep();
  };

  // Single stable handler for all inputs/selects
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLocalData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setLocalData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          })),
        () => alert('Unable to get your location. Please enter coordinates manually.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <form onSubmit={handleNext} className="p-6 md:p-8">
      <div className="space-y-6">

        {/* Region - Bilingual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Globe size={16} className="text-blue-500" />
              Region (English) <span className="text-red-500">*</span>
            </label>
            <select
              id="region_en"
              onKeyDown={handleKeyDown}
              value={localData.region_en}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none appearance-none cursor-pointer ${errors.region_en ? 'border-red-400' : 'border-gray-400 dark:border-gray-500'
                }`}
            >
              {ETHIOPIAN_REGIONS_EN.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.region_en && <p className="text-xs text-red-500">{errors.region_en}</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Globe size={16} className="text-green-500" />
              ክልል (አማርኛ) <span className="text-red-500">*</span>
            </label>
            <select
              id="region_am"
              onKeyDown={handleKeyDown}
              value={localData.region_am}
              onChange={handleInputChange}
              dir="rtl"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none appearance-none cursor-pointer ${errors.region_am ? 'border-red-400' : 'border-gray-400 dark:border-gray-500'
                }`}
            >
              {ETHIOPIAN_REGIONS_AM.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.region_am && <p className="text-xs text-red-500">{errors.region_am}</p>}
          </div>
        </div>

        {/* Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="zone_en"
            onKeyDown={handleKeyDown}
            label="Zone / City (English)"
            icon={Building}
            placeholder="e.g., Addis Ababa, Bahir Dar"
            required
            value={localData.zone_en}
            error={errors.zone_en}
            onChange={handleInputChange}
          />

          <InputField
            id="zone_am"
            onKeyDown={handleKeyDown}
            label="ዞን / ከተማ (አማርኛ)"
            icon={Building}
            placeholder="ለምሳሌ፡ አዲስ አበባ፣ ባህር ዳር"
            required
            value={localData.zone_am}
            error={errors.zone_am}
            dir="rtl"
            onChange={handleInputChange}
          />
        </div>

        {/* Sub-city */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="subCity_en"
            onKeyDown={handleKeyDown}
            label="Sub-city / Woreda (English)"
            icon={MapPin}
            placeholder="e.g., Bole, Kirkos"
            required
            value={localData.subCity_en}
            error={errors.subCity_en}
            onChange={handleInputChange}
          />

          <InputField
            id="subCity_am"
            onKeyDown={handleKeyDown}
            label="ንዑስ ከተማ / ወረዳ (አማርኛ)"
            icon={MapPin}
            placeholder="ለምሳሌ፡ ቦሌ፣ ቂርቆስ"
            required
            value={localData.subCity_am}
            error={errors.subCity_am}
            dir="rtl"
            onChange={handleInputChange}
          />
        </div>

        {/* Kebele & Detailed Address */}
        <InputField
          id="kebele"
          onKeyDown={handleKeyDown}
          label="Kebele"
          icon={MapPin}
          placeholder="e.g., 03/05"
          value={localData.kebele}
          error={errors.kebele}
          onChange={handleInputChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <InputField
            id="detailedAddress_en"
            label="Detailed Address / Landmark (english)"
            icon={Map}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Near Edna Mall"
            value={localData.detailedAddress_en}
            error={errors.detailedAddress_en}
            onChange={handleInputChange}
          />
          <div>
            <InputField
              id="detailedAddress_am"
              label="Detailed Address / Landmark (amharic)"
              icon={Map}
              onKeyDown={handleKeyDown}
              placeholder="ለምሳሌ፤, ማራኪ በርበር"
              value={localData.detailedAddress_am}
              error={errors.detailedAddress_am}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-gray-400 dark:border-gray-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Navigation size={16} className="text-blue-500" />
              GPS Coordinates
            </h3>
            <button
              type="button"
              onClick={handleGetLocation}
              className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <Navigation size={12} /> Get My Location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="latitude"
              onKeyDown={handleKeyDown}
              label="Latitude"
              icon={MapPin}
              type="number"
              placeholder="e.g., 9.0054"
              required
              value={localData.latitude}
              error={errors.latitude}
              hint="Enter latitude (-90 to 90)"
              onChange={handleInputChange}
            />
            <InputField
              id="longitude"
              onKeyDown={handleKeyDown}
              label="Longitude"
              icon={MapPin}
              type="number"
              placeholder="e.g., 38.7636"
              required
              value={localData.longitude}
              error={errors.longitude}
              hint="Enter longitude (-180 to 180)"
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Working Hour & Main Contact */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {
            registrationType === 'hospital' &&
            <InputField
              id="workingHour"
              onKeyDown={handleKeyDown}
              label="Working Hour"
              icon={Timer}
              type="text"
              placeholder="e.g 2:00 - 12:00AM"
              required
              value={localData.workingHour}
              error={errors.workingHour}
              onChange={handleInputChange}
            />
          }

          <InputField
            id="mainContactPhone"
            label={registrationType === 'hospital' ? 'Emergency Phone' : 'Main contact Phone'}
            icon={Phone}
            type="tel"
            onKeyDown={handleKeyDown}
            placeholder="09XXXXXXXX"
            required={registrationType === 'hospital'}
            value={localData.mainContactPhone}
            error={errors.mainContactPhone}
            hint={registrationType === 'hospital' ? 'Required for hospitals' : 'Main contact of pharmacy'}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Next Step <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default Step2Location;