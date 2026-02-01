/**
 * FacilityDetailPage - Dynamic detail page for hospitals and pharmacies
 * Shows facility information, services/inventory, location, and contact details
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Pill,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Navigation,
  ChevronLeft,
  Globe,
  Shield,
  Heart,
  Stethoscope,
  Package,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

const FacilityDetailPage = () => {
  const { type, id } = useParams(); // type: 'pharmacy' or 'hospital'
  const navigate = useNavigate();
  const location = useLocation();

  const [facility, setFacility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Determine facility type from URL
  const isPharmacy = type === 'pharmacy' || location.pathname.includes('pharmacy');
  const isHospital = type === 'hospital' || location.pathname.includes('hospital');

  // Fetch facility details
  useEffect(() => {
    const fetchFacility = async () => {
      setIsLoading(true);
      try {
        // In real app, fetch from API
        // const response = await fetch(`/api/${type}s/${id}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        setTimeout(() => {
          if (isPharmacy) {
            setFacility({
              id,
              name: 'Central Wellness Pharmacy',
              type: 'pharmacy',
              description: 'A leading pharmacy providing quality medications and healthcare products in Addis Ababa.',
              license: 'PH-9920-ETH',
              rating: 4.8,
              reviewCount: 124,
              address: 'Bole Road, Mega Building, Addis Ababa',
              region: 'Addis Ababa',
              coordinates: { lat: 9.01, lng: 38.75 },
              phone: '+251 911 22 33 44',
              alternatePhone: '+251 911 55 66 77',
              email: 'contact@centralwellness.com',
              workingHours: '08:00 AM - 10:00 PM',
              pharmacyType: 'Community Pharmacy',
              isVerified: true,
              services: [
                'Prescription Filling',
                'Over-the-Counter Medications',
                'Health Consultations',
                'Medicine Delivery',
              ],
              inventory: [
                { name: 'Paracetamol', generic: 'Paracetamol', price: 25, available: true },
                { name: 'Amoxicillin', generic: 'Amoxicillin', price: 85, available: true },
                { name: 'Ibuprofen', generic: 'Ibuprofen', price: 35, available: true },
                { name: 'Metformin', generic: 'Metformin HCL', price: 95, available: false },
              ],
            });
          } else {
            setFacility({
              id,
              name: 'St. Gabriel General Hospital',
              type: 'hospital',
              description: 'A comprehensive healthcare facility offering quality medical services with state-of-the-art equipment.',
              license: 'HO-4520-ETH',
              rating: 4.6,
              reviewCount: 312,
              address: 'Megenagna, Addis Ababa',
              region: 'Addis Ababa',
              coordinates: { lat: 9.02, lng: 38.78 },
              phone: '+251 911 55 66 77',
              emergencyPhone: '+251 911 00 00 00',
              email: 'info@stgabriel.com',
              workingHours: '24/7',
              ownershipType: 'Private',
              providesEmergency: true,
              operates24Hours: true,
              isVerified: true,
              departments: [
                { name: 'Cardiology', head: 'Dr. Abebe Kebede' },
                { name: 'Pediatrics', head: 'Dr. Sara Hailu' },
                { name: 'Orthopedics', head: 'Dr. Dawit Tesfa' },
                { name: 'Emergency', head: 'Dr. Helen Mengistu' },
              ],
              services: [
                { name: 'General Consultation', price: 500 },
                { name: 'ECG Test', price: 800 },
                { name: 'X-Ray', price: 600 },
                { name: 'Blood Test', price: 350 },
              ],
            });
          }
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching facility:', error);
        setIsLoading(false);
      }
    };

    fetchFacility();
  }, [id, type, isPharmacy, isHospital]);

  // Open in Google Maps
  const openInMaps = () => {
    if (facility?.coordinates) {
      const { lat, lng } = facility.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <Building2 size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-600 dark:text-gray-400">Facility not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white truncate">
              {facility.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {isPharmacy ? 'Pharmacy' : 'Hospital'} Details
            </p>
          </div>
          {facility.isVerified && (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs font-semibold">
              <Shield size={14} />
              Verified
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden mb-6"
        >
          {/* Gradient Header */}
          <div className={`h-32 ${isPharmacy ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
            <div className="h-full flex items-center justify-center">
              {isPharmacy ? (
                <Pill size={48} className="text-white/50" />
              ) : (
                <Building2 size={48} className="text-white/50" />
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 -mt-12">
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Logo/Icon */}
              <div className={`w-24 h-24 rounded-2xl ${isPharmacy ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg`}>
                {isPharmacy ? (
                  <Pill size={40} className="text-emerald-600" />
                ) : (
                  <Building2 size={40} className="text-blue-600" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {facility.name}
                  </h2>
                  {isHospital && facility.providesEmergency && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Heart size={12} />
                      Emergency
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">
                  {facility.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold">{facility.rating}</span>
                    <span className="text-slate-400 text-sm">({facility.reviewCount} reviews)</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock size={14} />
                    {facility.workingHours}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto">
                <a
                  href={`tel:${facility.phone}`}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold ${isPharmacy ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                >
                  <Phone size={18} />
                  Call
                </a>
                <button
                  onClick={openInMaps}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Navigation size={18} />
                  Directions
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', isPharmacy ? 'inventory' : 'departments', 'services', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? isPharmacy
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Globe size={18} className={isPharmacy ? 'text-emerald-500' : 'text-blue-500'} />
                  Quick Information
                </h3>
                <div className="space-y-4">
                  <InfoRow label="License" value={facility.license} />
                  <InfoRow label="Region" value={facility.region} />
                  {isPharmacy && <InfoRow label="Type" value={facility.pharmacyType} />}
                  {isHospital && <InfoRow label="Ownership" value={facility.ownershipType} />}
                  {isHospital && (
                    <InfoRow 
                      label="24/7 Operation" 
                      value={facility.operates24Hours ? 'Yes' : 'No'} 
                    />
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin size={18} className={isPharmacy ? 'text-emerald-500' : 'text-blue-500'} />
                  Location
                </h3>
                <p className="text-slate-600 dark:text-gray-400 mb-4">{facility.address}</p>
                <div className="bg-slate-100 dark:bg-gray-700 rounded-xl h-40 flex items-center justify-center mb-4">
                  <span className="text-slate-400">Map Preview</span>
                </div>
                <button
                  onClick={openInMaps}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 dark:border-gray-600 rounded-xl text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open in Google Maps
                </button>
              </div>
            </div>
          )}

          {/* Inventory Tab (Pharmacy) */}
          {activeTab === 'inventory' && isPharmacy && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Package size={18} className="text-emerald-500" />
                  Available Medications
                </h3>
              </div>
              <div className="divide-y dark:divide-gray-700">
                {facility.inventory?.map((item, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.generic}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{item.price} ETB</p>
                      <span className={`text-xs ${item.available ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments Tab (Hospital) */}
          {activeTab === 'departments' && isHospital && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Building2 size={18} className="text-blue-500" />
                  Departments
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {facility.departments?.map((dept, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="font-semibold">{dept.name}</p>
                    <p className="text-xs text-slate-400">{dept.head}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Stethoscope size={18} className={isPharmacy ? 'text-emerald-500' : 'text-blue-500'} />
                  Services
                </h3>
              </div>
              {isPharmacy ? (
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {facility.services?.map((service, index) => (
                      <span key={index} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {facility.services?.map((service, index) => (
                    <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50">
                      <p className="font-semibold">{service.name}</p>
                      <p className="font-bold text-blue-600">{service.price} ETB</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <MessageSquare size={18} className={isPharmacy ? 'text-emerald-500' : 'text-blue-500'} />
                Contact Information
              </h3>
              <div className="space-y-4">
                <ContactItem icon={Phone} label="Phone" value={facility.phone} href={`tel:${facility.phone}`} />
                {facility.alternatePhone && (
                  <ContactItem icon={Phone} label="Alternate" value={facility.alternatePhone} href={`tel:${facility.alternatePhone}`} />
                )}
                {facility.emergencyPhone && (
                  <ContactItem icon={Heart} label="Emergency" value={facility.emergencyPhone} href={`tel:${facility.emergencyPhone}`} isEmergency />
                )}
                {facility.email && (
                  <ContactItem icon={Mail} label="Email" value={facility.email} href={`mailto:${facility.email}`} />
                )}
                <ContactItem icon={MapPin} label="Address" value={facility.address} />
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

// Helper Components
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-500 dark:text-gray-400 text-sm">{label}</span>
    <span className="font-semibold text-slate-800 dark:text-white">{value}</span>
  </div>
);

const ContactItem = ({ icon: Icon, label, value, href, isEmergency }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl">
    <div className={`p-3 rounded-lg ${isEmergency ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
      <Icon size={20} className={isEmergency ? 'text-red-600' : 'text-blue-600'} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-slate-400">{label}</p>
      {href ? (
        <a href={href} className="font-semibold text-slate-800 dark:text-white hover:underline">
          {value}
        </a>
      ) : (
        <p className="font-semibold text-slate-800 dark:text-white">{value}</p>
      )}
    </div>
  </div>
);

export default FacilityDetailPage;
