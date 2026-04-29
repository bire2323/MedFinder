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
import { formatWorkingHours, getTodayHours } from '../utils/workingHoursUtils';
import apiStartChatSession from '../api/RealtimeChat';
import useAuthStore from '../store/UserAuthStore';
import toast from 'react-hot-toast';
import Loading from '../component/SupportiveComponent/Loading';
import { localizeFacility } from '../hooks/Localizer';


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
  // Open in Map
  const openInMaps = () => {
    if (facility?.lat && facility?.lng) {
      navigate('/home/map', { state: { selectedFacility: facility } });
    } else {
      toast.error(t("FacilityDetail.NoLocation") || "Location not available");
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
      // console.log("resp", sessionData);

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

      <Loading />

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
          className="bg-white/80 backdrop-blur-2xl dark:bg-gray-800/90 rounded-[2rem] shadow-2xl border border-white/40 dark:border-gray-700/50 overflow-hidden mb-8 transform transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Gradient Header */}
          <div className={`h-40 relative overflow-hidden ${type === 'pharmacy' ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600' : 'bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600'}`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              {type === 'pharmacy' ? (
                <Pill size={120} className="text-white transform rotate-12" />
              ) : (
                <Building2 size={120} className="text-white transform -rotate-12" />
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-8 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo/Icon */}
              <div className={`w-32 h-32 rounded-[1.5rem] ${type === "pharmacy" ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'bg-blue-50 dark:bg-blue-900/50'} flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl transform hover:scale-105 transition-transform duration-300`}>
                {facility.logo_url ? (
                  <img src={facility.logo_url} alt="logo" className="w-full h-full object-cover rounded-[1.2rem]" />
                ) : type === 'pharmacy' ? (
                  <Pill size={56} className="text-emerald-500" />
                ) : (
                  <Building2 size={56} className="text-blue-500" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {facility.facility_name}
                  </h2>
                  {type === 'hospital' && facility.contact_phone && (
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
                    <span className="font-medium">Today: {getTodayHours(facility.working_hour)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full md:w-auto">
                <a
                  href={`tel:${facility.contact_phone}`}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-[1.2rem] font-bold shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 ${type === 'pharmacy' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-all duration-300`}
                >
                  <Phone size={20} />
                  {t("FacilityDetail.Call")}
                </a>
                <button
                  onClick={openInMaps}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-[1.2rem] font-bold bg-white/80 dark:bg-gray-700/80 backdrop-blur text-slate-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 border border-slate-200 dark:border-gray-600 shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Navigation size={20} className="text-blue-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Info */}
              <div className="bg-white/60 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl p-6 border border-white/20 shadow-xl dark:border-gray-700/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Globe size={18} className={type === 'pharmacy' ? 'text-emerald-500' : 'text-blue-500'} />
                  {t("FacilityDetail.QuickInfo")}
                </h3>
                <div className="space-y-4">
                  <InfoRow label={t("FacilityDetail.License")} value={facility.license_number} />
                  <InfoRow label={t("FacilityDetail.Region")} value={facility.addresses?.[0]?.region || facility.region} />
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

              {/* Working Hours */}
              <div className="bg-white/60 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl p-6 border border-white/20 shadow-xl dark:border-gray-700/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock size={18} className={type === 'pharmacy' ? 'text-emerald-500' : 'text-blue-500'} />
                  {t("FacilityDetail.WorkingHours")}
                </h3>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                    Today: <span className="text-emerald-600 dark:text-emerald-400">{getTodayHours(facility.working_hour)}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-gray-400 space-y-1">
                    {(() => {
                      let parsed;
                      try {
                        parsed = typeof facility.working_hour === 'string' ? JSON.parse(facility.working_hour) : facility.working_hour;
                      } catch (e) {
                        parsed = {};
                      }
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const dayNames = {
                        Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun'
                      };
                      return days.map(day => {
                        const hours = parsed?.[day] || [];
                        const isClosed = !hours || hours.length === 0;
                        return (
                          <div key={day} className="flex justify-between items-center">
                            <span className="font-medium">{dayNames[day]}</span>
                            <span className={isClosed ? 'text-red-500' : 'text-emerald-600'}>
                              {isClosed ? 'Closed' : `${Math.min(...hours)}:00 - ${Math.max(...hours) + 1}:00`}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/60 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl p-6 border border-white/20 shadow-xl dark:border-gray-700/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin size={18} className={type === 'pharmacy' ? 'text-emerald-500' : 'text-blue-500'} />
                    {t("FacilityDetail.Location")}
                  </h3>
                  <div className="text-slate-600 dark:text-gray-400 mb-6 space-y-2">
                    {facility.addresses?.map((a, i) => (
                      <div key={i} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-600">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-gray-300">
                          <MapPin size={14} className="text-emerald-500" />
                          {a.region}, {a.zone}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 ml-6">
                          {a.sub_city}, Kebele: {a.kebele}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={openInMaps}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 mt-auto"
                >
                  <Navigation size={18} />
                  {t("FacilityDetail.Directions") || "View on Map"}
                </button>
              </div>
            </div>
          )}

          {/* Inventory Tab (Pharmacy) */}
          {activeTab === 'inventory' && type === 'pharmacy' && (
            <div className="bg-slate-50 dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b dark:border-gray-300 mb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Package size={18} className="text-emerald-500" />
                  {t("FacilityDetail.AvailableMeds")}
                </h3>
              </div>
              <div className="flex flex-wrap w-fit px-2 dark:divide-gray-700">
                {facility.inventory?.map((item, index) => (
                  <div key={index} className="p-2 m-2 rounded-xl bg-white dark:bg-slate-400 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50">
                    <div className='p-2'>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.generic_name}</p>
                      <p className="text-xs text-slate-400">{item.brand_name}</p>
                    </div>
                    <div className="text-right p-2">
                      <p className="font-bold text-emerald-600">{item.price} ETB</p>
                      <span className={`text-xs ${item.status ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.status ? t("FacilityDetail.InStock") : t("FacilityDetail.OutOfStock")}
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
                    <p className="text-xs text-slate-400">{dept.category}</p>
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
                      <div key={index} className="flex flex-col items-center">
                        <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-sm">
                          {service?.name}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{service?.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {facility.services?.map((service, index) => (
                    <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50">
                      <p className="font-semibold">{service.service?.name}</p>
                      <p className="font-bold text-blue-600">{service.service?.category}</p>
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
                <ContactItem icon={Phone} label={t("Login.Phone")} value={facility.contact_phone} href={`tel:${facility.contact_phone}`} />
                {facility.contact_phone && (
                  <ContactItem icon={Phone} label={t("FacilityDetail.Alternate")} value={facility.contact_phone} href={`tel:${facility.alternatePhone}`} />
                )}
                {facility.emergencyPhone && (
                  <ContactItem icon={Heart} label={t("FacilityDetail.Emergency")} value={facility.emergencyPhone} href={`tel:${facility.emergencyPhone}`} isEmergency />
                )}
                {facility.contact_email && (
                  <ContactItem icon={Mail} label={t("FacilityDetail.Email")} value={facility.contact_email} href={`mailto:${facility.contact_email}`} />
                )}
                <ContactItem icon={MapPin} label={t("FacilityDetail.Address")} value={facility.address_description} />
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