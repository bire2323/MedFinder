import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Reusable Card Component
const FacilityCard = ({ facility, onViewDetails, onMapView }) => {
  const { t } = useTranslation();
  const getFacilityName = () => {
    return facility.type === 'hospital'
      ? facility.hospital_name_en
      : facility.pharmacy_name_en;
  };

  const getFacilityAddress = () => {
    return facility.address_description_en || '';
  };

  const getFacilityTypeColor = () => {
    return facility.type === "Hospital" || facility.type === "hospital"
      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300";
  };

  const facilityInfo = [
    { label: t('search.type'), value: facility.type },
    { label: t('search.rating'), value: facility.rating, icon: <FaStar className="text-yellow-400 inline mr-1" /> },
    { label: t('search.service'), value: facility.is_full_time_service === 1 ? t('search.available247') : t('search.regularHours') },
    { label: t('search.contact'), value: facility.phone || '' },
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-gray-700"
    >
      <div className="p-6 relative"> {/* Added relative positioning */}
        {/* Left Circle Image and Right Text List */}
        <div className="flex items-start gap-4">
          {/* Left Circle Image */}
          <div className="flex-shrink-0">
            <div className="w-30 h-30 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-700 opacity-75 shadow-md">
              <img
                src={facility?.logo || '/default-facility-image.png'}
                alt={getFacilityName()}
                className="w-full h-full object-cover"

              />
            </div>
          </div>

          {/* Right List of Text */}
          <div className="flex-1 space-y-2">
            {/* Facility Type Badge */}
            <div>
              <span
                className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded ${getFacilityTypeColor()}`}
              >
                {facility.type}
              </span>
            </div>

            {/* Facility Name */}
            <h3 className="text-lg font-bold dark:text-white line-clamp-1">
              {getFacilityName()}
            </h3>

            {/* Information List */}
            <ul className="space-y-1 text-sm">
              {facilityInfo.map((info, index) => (
                <li key={index} className="flex items-start text-slate-600 dark:text-slate-300">
                  <span className="inline-block w-20 text-slate-400 dark:text-slate-500">
                    {info.label}:
                  </span>
                  <span className="flex-1 flex items-center">
                    {info.icon}
                    {info.value}
                  </span>
                </li>
              ))}
            </ul>

            {/* Address */}
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              📍 {getFacilityAddress()}
            </p>
          </div>
        </div>

        {/* Rating Badge - Positioned Absolute */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
          <FaStar className="text-yellow-400" /> {facility?.rating || 'N/A'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-slate-100 dark:border-gray-700">
        <button
          className="flex-1 cursor-pointer py-3 bg-slate-50 dark:bg-gray-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-white font-bold transition-colors"
          onClick={() => onViewDetails(facility)}
        >
          {t('search.viewDetails')}
        </button>
        <button
          className="flex-1 cursor-pointer py-3 bg-slate-50 dark:bg-gray-700 hover:bg-green-600 hover:text-white text-slate-700 dark:text-white font-bold transition-colors border-l border-slate-200 dark:border-gray-600 flex items-center justify-center gap-2"
          onClick={() => onMapView(facility)}
        >
          <FaMapMarkerAlt /> {t('search.mapView')}
        </button>
      </div>
    </motion.div>
  );
};

// Loading Skeleton Component
const FacilityCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-gray-700 animate-pulse">
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4/6 bg-slate-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
    <div className="flex border-t border-slate-100 dark:border-gray-700">
      <div className="flex-1 h-12 bg-slate-200 dark:bg-gray-700" />
      <div className="flex-1 h-12 bg-slate-200 dark:bg-gray-700" />
    </div>
  </div>
);

// Modified FacilityGrid to accept handlers as props
const FacilityGrid = ({
  facilities,
  loading = false,
  onViewDetails,
  onMapView
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <FacilityCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!facilities || facilities.length === 0) {
    const { t } = useTranslation();
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {t('search.comingSoon')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {facilities.map((facility, index) => (
        <FacilityCard
          key={facility.id || index}
          facility={facility}
          onViewDetails={onViewDetails}
          onMapView={onMapView}
        />
      ))}
    </div>
  );
};

export default FacilityGrid;