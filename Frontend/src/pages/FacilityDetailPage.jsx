/**
 * FacilityDetailPage - Dynamic detail page for hospitals and pharmacies
 * Shows facility information, services/inventory, location, and contact details
 * Now includes patient-initiated real-time chat
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  X,
} from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizeFacility } from '../hooks/Localizer';
import apiStartChatSession from '../api/RealtimeChat';
import useAuthStore from '../store/UserAuthStore';
import toast from 'react-hot-toast';
import Loading from '../component/SupportiveComponent/Loading';


const FacilityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { type, data } = useLoaderData();
  const { i18n } = useTranslation();

  const [facility, setFacility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Chat states
  const [chatSession, setChatSession] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);




  // Current user ID (adjust based on your auth system)
  const { user, isAuthenticated, roles } = useAuthStore();
  const currentUserId = user?.id;

  // Load and localize facility
  useEffect(() => {
    const result = localizeFacility(data, type, i18n.language);
    setFacility(result);
    setIsLoading(false);
  }, [data, type, i18n.language]);
  //console.log("isauth", isAuthenticated);
  // Open in Google Maps
  const openInMaps = () => {
    if (facility?.coordinates) {
      const { lat, lng } = facility.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };


  // Start or get chat session
  const handleStartChat = async () => {
    if (!isAuthenticated || !currentUserId) {
      toast.error(t('facility_detail_page.please_login_to_chat'));
      setTimeout(() => {
        navigate('/login');
      }, 6000);
      return;
    }

    setChatLoading(true);
    setChatError(null);

    try {
      // Build payload directly — no extra state needed
      const payload = {
        language: i18n.language.startsWith('am') ? 'am' : 'en',
        [type === 'pharmacy' ? 'pharmacy_id' : 'hospital_id']: id,   // dynamic key
      };

      const response = await apiStartChatSession(payload);   // ← pass payload
      // If apiStartChatSession is a fetch wrapper, handle it like this:


      const sessionData = await response;
      console.log("resp", sessionData);

      navigate(`/user/dashboard?session=${sessionData?.id ?? sessionData?.chat_session_id} `, { state: { openChatSessionId: sessionData?.id ?? sessionData?.chat_session_id } });
    } catch (err) {
      setChatError(err.message || t('facility_detail_page.chat_initiation_error'));
      toast.error(t("facility_detail_page.chatin_errors"));
      console.error('Chat initiation error:', err);
    } finally {
      setChatLoading(false);
    }

  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        {/*<Loader2 className="h-12 w-12 animate-spin text-blue-600" />*/}
        <Loading />
      </div>
    );
  }

  if (!data || !facility) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <Building2 size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-600 dark:text-gray-400">{t("FacilityDetail.NotFound")}</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t("FacilityDetail.GoBack")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative">
      {console.log("facility", facility)}
      {console.log("data", data)}
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
              {facility.facility_name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {type === 'pharmacy' ? 'Pharmacy' : 'Hospital'} Details
            </p>
          </div>
          {data.status === 'APPROVED' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs font-semibold">
              <Shield size={14} />
              {t("FacilityDetail.Verified")}
            </div>
          )}
        </div>
      </header>

      {/* Floating Chat Button (quick access) */}
      <button
        onClick={handleStartChat}
        disabled={chatLoading}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg text-white flex items-center justify-center transition-all ${chatLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        title="Chat with facility"
      >
        {chatLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <MessageSquare size={24} />
        )}
      </button>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden mb-6"
        >
          {/* Gradient Header */}
          <div className={`h-32 ${type === 'pharmacy' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
            <div className="h-full flex items-center justify-center">
              {type === 'pharmacy' ? (
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
              <div className={`w-24 h-24 rounded-2xl ${type === "pharmacy" ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg`}>
                {type === 'pharmacy' ? (
                  <Pill size={40} className="text-emerald-600" />
                ) : (
                  <Building2 size={40} className="text-blue-600" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {facility.facility_name}
                  </h2>
                  {type === 'hospital' && facility.emergency_contact && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Heart size={12} />
                      {t("FacilityDetail.Emergency")}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">
                  {facility.address_description}
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
                    {facility.working_hour}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto">
                <a
                  href={`tel:${facility.phone || facility.emergency_contact}`}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold ${type === 'pharmacy' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors`}
                >
                  <Phone size={18} />
                  {t("FacilityDetail.Call")}
                </a>
                <button
                  onClick={openInMaps}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Navigation size={18} />
                  {t("FacilityDetail.Directions")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', type === 'pharmacy' ? 'inventory' : 'departments', 'services', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab
                ? type === 'pharmacy'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                }`}
            >
              {tab === 'overview' && t("FacilityDetail.Tabs.Overview")}
              {tab === 'inventory' && t("FacilityDetail.Tabs.Inventory")}
              {tab === 'departments' && t("FacilityDetail.Tabs.Departments")}
              {tab === 'services' && t("FacilityDetail.Tabs.Services")}
              {tab === 'contact' && t("FacilityDetail.Tabs.Contact")}
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
                  <Globe size={18} className={type === 'pharmacy' ? 'text-emerald-500' : 'text-blue-500'} />
                  {t("FacilityDetail.QuickInfo")}
                </h3>
                <div className="space-y-4">
                  <InfoRow label={t("FacilityDetail.License")} value={facility.license_number} />
                  <InfoRow label={t("FacilityDetail.Region")} value={facility.region} />
                  {type === 'pharmacy' && <InfoRow label={t("FacilityDetail.Type")} value={facility.facility_ownership_type} />}
                  {type === 'hospital' && <InfoRow label={t("FacilityDetail.Ownership")} value={facility.facility_ownership_type} />}
                  {type === 'hospital' && (
                    <InfoRow
                      label={t("FacilityDetail.FullTime")}
                      value={facility.is_full_time_service ? t("FacilityDetail.Yes") : t("FacilityDetail.No")}
                    />
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin size={18} className={type === 'pharmacy' ? 'text-emerald-500' : 'text-blue-500'} />
                  {t("FacilityDetail.Location")}
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
                  {t("FacilityDetail.OpenMaps")}
                </button>
              </div>
            </div>
          )}

          {/* Inventory Tab (Pharmacy) */}
          {activeTab === 'inventory' && type === 'pharmacy' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Package size={18} className="text-emerald-500" />
                  {t("FacilityDetail.AvailableMeds")}
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
                        {item.available ? t("FacilityDetail.InStock") : t("FacilityDetail.OutOfStock")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments Tab (Hospital) */}
          {activeTab === 'departments' && type === 'hospital' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Building2 size={18} className="text-blue-500" />
                  {t("FacilityDetail.Tabs.Departments")}
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
                  <Stethoscope size={18} className={type === 'pharmacy' ? 'text-emerald-500' : 'text-blue-500'} />
                  {t("FacilityDetail.Tabs.Services")}
                </h3>
              </div>
              {type === 'hospital' ? (
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
                      <p className="font-bold text-blue-600">{service.price} {t("Common.Currency")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab – Now with Chat button */}
          {activeTab === 'contact' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <MessageSquare size={18} className={type === 'hospital' ? 'text-emerald-500' : 'text-blue-500'} />
                {t("FacilityDetail.ContactInfo")}
              </h3>

              {/* Chat initiation section */}
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-600" />
                  {t("FacilityDetail.ChatWith", { name: facility.facility_name })}
                </h4>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                  {t("FacilityDetail.ChatDesc")}
                </p>

                {chatError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {chatError}
                  </div>
                )}

                <button
                  onClick={handleStartChat}
                  disabled={chatLoading || chatSession}
                  className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition ${chatLoading || chatSession
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-blue-700'
                    }`}
                >
                  {chatLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("FacilityDetail.StartingChat")}
                    </>
                  ) : chatSession ? (
                    t("FacilityDetail.ChatOpened")
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      {t("FacilityDetail.StartChatNow")}
                    </>
                  )}
                </button>
              </div>

              {/* Contact details */}
              <div className="space-y-4">
                <ContactItem icon={Phone} label={t("Login.Phone")} value={facility.phone} href={`tel:${facility.phone}`} />
                {facility.alternatePhone && (
                  <ContactItem icon={Phone} label={t("FacilityDetail.Alternate")} value={facility.alternatePhone} href={`tel:${facility.alternatePhone}`} />
                )}
                {facility.emergencyPhone && (
                  <ContactItem icon={Heart} label={t("FacilityDetail.Emergency")} value={facility.emergencyPhone} href={`tel:${facility.emergencyPhone}`} isEmergency />
                )}
                {facility.email && (
                  <ContactItem icon={Mail} label={t("FacilityDetail.Email")} value={facility.email} href={`mailto:${facility.email}`} />
                )}
                <ContactItem icon={MapPin} label={t("FacilityDetail.Address")} value={facility.address} />
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Chat Modal / Inline Window */}
      {/* Chat modal removed: users are redirected to /user/dashboard to continue chat in the Messages panel */}
    </div>
  );
};

// Helper Components (unchanged)
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