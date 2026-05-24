/**
 * FacilityDetailPage - Dynamic detail page for hospitals and pharmacies
 * Complete Redesign: Premium Health-Tech Architecture
 */
import React, { useState, useEffect, useRef } from 'react';
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
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatWorkingHours, getTodayHours, formatDayWorkingHours } from '../utils/workingHoursUtils';
import apiStartChatSession from '../api/RealtimeChat';
import useAuthStore from '../store/UserAuthStore';
import toast from 'react-hot-toast';
import Loading from '../component/SupportiveComponent/Loading';
import { localizeFacility } from '../hooks/Localizer';

const FacilityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { type, data } = useLoaderData();

  const [facility, setFacility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Scrollspy state
  const [activeSection, setActiveSection] = useState('overview');

  // Chat states
  const [chatSession, setChatSession] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const [selectedDrug, setSelectedDrug] = useState(null);

  const { user, isAuthenticated } = useAuthStore();
  const currentUserId = user?.id;

  const maskLicenseNumber = (license) => {
    if (!license) return '**********';
    const visibleCount = Math.ceil(license.length / 2);
    const hiddenCount = Math.max(license.length - visibleCount, 0);
    return `${license.slice(0, visibleCount)}${'*'.repeat(hiddenCount)}`;
  };

  // Load and localize facility
  useEffect(() => {
    const result = localizeFacility(data, type, i18n.language);
    setFacility(result);
    setIsLoading(false);
  }, [data, type, i18n.language]);

  useEffect(() => {
    if (!facility?.inventory?.length) {
      setSelectedDrug(null);
      return;
    }
    setSelectedDrug((prev) => prev ?? facility.inventory[0]);
  }, [facility]);

  // Scrollspy Intersection Observer setup
  useEffect(() => {
    if (isLoading || !facility) return;

    const observer = new IntersectionObserver((entries) => {
      // Find the currently intersecting entry that is closest to the top
      let currentIntersecting = null;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!currentIntersecting || entry.intersectionRatio > currentIntersecting.intersectionRatio) {
            currentIntersecting = entry;
          }
        }
      });

      if (currentIntersecting) {
        setActiveSection(currentIntersecting.target.id);
      }
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [isLoading, facility]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180; // Offset for sticky header & nav
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const openInMaps = () => {
    if (facility?.lat && facility?.lng) {
      navigate('/home/map', { state: { selectedFacility: facility } });
    } else {
      toast.error(t("FacilityDetail.NoLocation") || "Location not available");
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated || !currentUserId) {
      toast.error(t('facility_detail_page.please_login_to_chat') || "Please login to chat");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    setChatLoading(true);
    setChatError(null);

    try {
      const payload = {
        language: i18n.language.startsWith('am') ? 'am' : 'en',
        [type === 'pharmacy' ? 'pharmacy_id' : 'hospital_id']: id,
      };

      const response = await apiStartChatSession(payload);
      const sessionData = await response;

      navigate(`/user/dashboard?session=${sessionData?.id ?? sessionData?.chat_session_id} `, { state: { openChatSessionId: sessionData?.id ?? sessionData?.chat_session_id } });
    } catch (err) {
      setChatError(err.message || t('facility_detail_page.chat_initiation_error'));
      toast.error(t("facility_detail_page.chatin_errors") || "Error starting chat");
      console.error('Chat initiation error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  if (!data || !facility) {
    return (
      <div className="min-h-screen bg-[#FAFCFF] dark:bg-[#0A0F1C] flex flex-col items-center justify-center p-4">
        <Building2 size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-600 dark:text-gray-400">{t("FacilityDetail.NotFound")}</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          {t("FacilityDetail.GoBack")}
        </button>
      </div>
    );
  }

  const isPharmacy = type === 'pharmacy';
  const themeColor = isPharmacy ? 'emerald' : 'blue';

  // Parse working hours safely
  let parsedHours = {};
  try {
    parsedHours = typeof facility.working_hour === 'string' ? JSON.parse(facility.working_hour) : facility.working_hour;
  } catch (e) {
    parsedHours = {};
  }

  // Check if currently open (simplified check based on today's hours)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayHours = parsedHours?.[today] || [];
  const todayHoursLabel = formatDayWorkingHours(todayHours);
  const isClosedToday = !todayHoursLabel;
  // Note: a more complex check would compare current time against hours array, keeping it simple for UI

  const navItems = [
    { id: 'overview', label: t("FacilityDetail.Tabs.Overview") || 'Overview' },
    { id: isPharmacy ? 'inventory' : 'departments', label: isPharmacy ? (t("FacilityDetail.Tabs.Inventory") || 'Inventory') : (t("FacilityDetail.Tabs.Departments") || 'Departments') },
    { id: 'services', label: t("FacilityDetail.Tabs.Services") || 'Services' },
    { id: 'contact', label: t("FacilityDetail.Tabs.Contact") || 'Contact & Location' }
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] dark:bg-[#0D1321] font-sans pb-28 lg:pb-12 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20">

      {/* 1. GLOBAL STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-800/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-full transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-gray-400">
                <span>{isPharmacy ? 'Pharmacies' : 'Hospitals'}</span>
                <span>/</span>
                <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{facility.facility_name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data.status === 'APPROVED' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold ring-1 ring-emerald-200 dark:ring-emerald-500/20">
                <CheckCircle2 size={14} className="fill-emerald-100 dark:fill-none" />
                {t("FacilityDetail.Verified") || "Verified Partner"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. IMMERSIVE HERO SECTION */}
      <section className="relative bg-white dark:bg-[#111827] border-b border-slate-200/50 dark:border-gray-800/50 overflow-hidden">
        {/* Premium Background Graphic */}
        <div className={`absolute inset-0 h-64 opacity-90 ${isPharmacy ? 'bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-800' : 'bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-900'}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          {/* Abstract Orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-[80px]"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-black/20 rounded-full blur-[60px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">

            {/* Avatar */}
            <div className={`shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-[2rem] p-1.5 bg-white/20 backdrop-blur-md shadow-2xl ring-1 ring-white/30 z-10 flex items-center justify-center`}>
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[1.7rem] overflow-hidden flex items-center justify-center">
                {facility.logo_url ? (
                  <img src={facility.logo_url} alt="logo" className="w-full h-full object-cover" />
                ) : isPharmacy ? (
                  <Pill size={64} className="text-emerald-500 drop-shadow-sm" />
                ) : (
                  <Building2 size={64} className="text-blue-500 drop-shadow-sm" />
                )}
              </div>
            </div>

            {/* Title & Core Info */}
            <div className="flex-1 w-full text-slate-900 dark:text-white mt-4 md:mt-0">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-sm">
                {facility.facility_name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Star size={18} className="text-amber-400 fill-amber-400 drop-shadow-sm" />
                  <span className="font-bold text-slate-800 dark:text-white text-base">{facility.rating || '4.8'}</span>
                  <span>({facility.reviewCount || '124'} reviews)</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className={isPharmacy ? 'text-emerald-500' : 'text-blue-500'} />
                  <span className="truncate max-w-[200px] sm:max-w-md">{facility.address_description}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-1.5 font-bold">
                  {isClosedToday ? (
                    <span className="text-rose-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Closed Today</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Open Today</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SCROLLSPY NAVIGATION (STICKY BELOW HEADER) */}
      <div className="sticky top-16 z-40 bg-[#F6F9FC]/90 dark:bg-[#0D1321]/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-3">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive
                    ? 'text-slate-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10'
                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MAIN LAYOUT CONTAINER (2-COLUMN) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 relative items-start">

          {/* LEFT COLUMN: CONTENT SECTIONS */}
          <div className="flex-1 w-full min-w-0 space-y-16">

            {/* OVERVIEW SECTION */}
            <section id="overview" className="scroll-mt-36">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isPharmacy ? 'bg-emerald-100/50 text-emerald-600' : 'bg-blue-100/50 text-blue-600'}`}>
                  <Info size={24} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Overview</h2>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 dark:ring-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">License Number</p>
                    <p className="font-extrabold text-lg">{maskLicenseNumber(facility.license_number)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Region / Ownership</p>
                    <p className="font-extrabold text-lg">{facility.addresses?.[0]?.region || facility.region} • {facility.facility_ownership_type}</p>
                  </div>
                  {!isPharmacy && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Type</p>
                      <div className="flex items-center gap-2 mt-1">
                        {facility.is_full_time_service ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm font-bold rounded-lg ring-1 ring-emerald-200 dark:ring-emerald-500/20">Full-Time (24/7)</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-bold rounded-lg ring-1 ring-slate-200 dark:ring-gray-700">Part-Time</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* DEPARTMENTS / INVENTORY SECTION */}
            {isPharmacy ? (
              <section id="inventory" className="scroll-mt-36">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100/50 text-emerald-600">
                      <Package size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight">Available Inventory</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                        Browse drugs, then select an item to view detailed pricing, availability and prescription info.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-3 py-1 bg-white dark:bg-gray-800 text-sm font-bold text-slate-500 rounded-full ring-1 ring-slate-200 dark:ring-gray-700">
                    {facility.inventory?.length || 0} Items
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1.3fr] gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {facility.inventory?.map((item, index) => {
                        const isSelected = selectedDrug === item;
                        return (
                          <button
                            key={item.id ?? index}
                            type="button"
                            onClick={() => setSelectedDrug(item)}
                            className={`text-left group p-5 rounded-[1.5rem] bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-slate-900/5 dark:ring-white/10 transition-all duration-300 ${isSelected ? 'ring-2 ring-emerald-300 dark:ring-emerald-600 shadow-[0_12px_30px_rgb(16,185,129,0.18)]' : 'hover:-translate-y-1 hover:ring-emerald-300 dark:hover:ring-emerald-700 hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)]'} focus:outline-none`}
                          >
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-lg leading-tight mb-1 truncate">{item.name}</h4>
                                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 truncate">{item.generic_name}</p>
                              </div>
                              <span className={`shrink-0 px-2 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-lg ${item.status ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-500/30' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/30'}`}>
                                {item.status ? 'In Stock' : 'Out'}
                              </span>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-gray-800 flex flex-col gap-2">
                              <p className="text-xs font-semibold text-slate-400">{item.brand_name || 'Generic'}</p>
                              <p className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                                {item.price} <span className="text-sm font-bold opacity-70">ETB</span>
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>


                  </div>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 dark:ring-white/10 h-full">
                      {selectedDrug ? (
                        <>
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Drug</p>
                              <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{selectedDrug.name}</h3>
                              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">{selectedDrug.generic_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selectedDrug.price} <span className="text-base font-bold">ETB</span></p>
                              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-gray-400">{selectedDrug.stock ?? 0} units</p>
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-slate-700 dark:text-white">About</p>
                              <p className="text-sm leading-7 text-slate-500 dark:text-gray-400">{selectedDrug.about_drug || selectedDrug.about_drug_en || 'No description available.'}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="rounded-2xl bg-slate-50 dark:bg-gray-900 p-4 border border-slate-200/80 dark:border-gray-800">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prescription</p>
                                <p className={`mt-2 font-bold ${selectedDrug.prescription_required ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {selectedDrug.prescription_required ? 'Required' : 'Not Required'}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 dark:bg-gray-900 p-4 border border-slate-200/80 dark:border-gray-800">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Expire Date</p>
                                <p className="mt-2 font-bold text-slate-900 dark:text-white">{selectedDrug.expire_date || 'Unknown'}</p>
                              </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50 dark:bg-gray-900 p-4 border border-slate-200/80 dark:border-gray-800">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Availability</p>
                              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-gray-200">{selectedDrug.status ? 'Available for purchase' : 'Currently unavailable'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300/60 bg-slate-50 dark:border-gray-700 dark:bg-gray-900 p-8 text-center">
                          <div className="mb-4 text-6xl">💊</div>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Pick a drug to preview</h3>
                          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Select any inventory card to see pricing, stock, prescription and expiry details.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section id="departments" className="scroll-mt-36">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100/50 text-blue-600">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Departments</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {facility.departments?.map((dept, index) => (
                    <div key={index} className="group p-5 rounded-[1.5rem] bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-slate-900/5 dark:ring-white/10 hover:ring-blue-300 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4">
                      <div className="p-3.5 rounded-2xl bg-[#F6F9FC] dark:bg-gray-800 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <Stethoscope size={24} />
                      </div>
                      <div className="flex flex-col justify-center h-full pt-1">
                        <h4 className="font-extrabold text-lg mb-1.5 leading-tight">{dept.name}</h4>
                        <span className="inline-flex w-fit px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg ring-1 ring-blue-200 dark:ring-blue-500/20">
                          {dept.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SERVICES SECTION */}
            <section id="services" className="scroll-mt-36">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isPharmacy ? 'bg-emerald-100/50 text-emerald-600' : 'bg-blue-100/50 text-blue-600'}`}>
                  <Stethoscope size={24} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Specialized Services</h2>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 dark:ring-white/10">
                <div className="flex flex-wrap gap-3">
                  {facility.services?.map((service, index) => {
                    const name = isPharmacy ? service.service?.name : service?.name;
                    const category = isPharmacy ? service.service?.category : service?.category;
                    return (
                      <div key={index} className="flex flex-col px-4 py-3 bg-[#F6F9FC] dark:bg-gray-800 rounded-2xl ring-1 ring-slate-200 dark:ring-gray-700 hover:shadow-md transition-shadow cursor-default">
                        <span className="font-extrabold text-slate-900 dark:text-white text-[15px]">{name}</span>
                        <span className={`text-xs font-bold mt-0.5 ${isPharmacy ? 'text-emerald-600' : 'text-blue-600'}`}>{category}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* CONTACT / LOCATION SECTION */}
            <section id="contact" className="scroll-mt-36">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isPharmacy ? 'bg-emerald-100/50 text-emerald-600' : 'bg-blue-100/50 text-blue-600'}`}>
                  <MapPin size={24} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Location & Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Map / Address Card */}
                <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col">
                  <div className="flex-1 space-y-6">
                    {facility.addresses?.map((a, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={`mt-1 ${isPharmacy ? 'text-emerald-500' : 'text-blue-500'}`}>
                          <MapPin size={24} />
                        </div>
                        <div>
                          <div className="font-extrabold text-xl text-slate-900 dark:text-white mb-2">
                            {a.region}, {a.zone}
                          </div>
                          <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 leading-relaxed">
                            {a.sub_city}<br />Kebele: {a.kebele}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={openInMaps}
                    className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 bg-[#F6F9FC] dark:bg-gray-800 text-slate-900 dark:text-white font-extrabold rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors ring-1 ring-slate-200 dark:ring-gray-700"
                  >
                    <Globe size={18} />
                    Open in Maps
                  </button>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 dark:ring-white/10 space-y-6">
                  <ContactRow icon={Phone} label="Primary Phone" value={facility.contact_phone} href={`tel:${facility.contact_phone}`} themeColor={themeColor} />
                  {facility.alternatePhone && (
                    <ContactRow icon={Phone} label="Alternate Phone" value={facility.alternatePhone} href={`tel:${facility.alternatePhone}`} themeColor={themeColor} />
                  )}
                  {facility.contact_email && (
                    <ContactRow icon={Mail} label="Email Address" value={facility.contact_email} href={`mailto:${facility.contact_email}`} themeColor={themeColor} />
                  )}
                  {facility.emergencyPhone && (
                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-gray-800">
                      <ContactRow icon={AlertCircle} label="Emergency Hotline" value={facility.emergencyPhone} href={`tel:${facility.emergencyPhone}`} isEmergency />
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: STICKY ACTION & TRUST PANEL (DESKTOP ONLY) */}
          <aside className="hidden lg:block w-[360px] shrink-0">
            <div className="sticky top-36 space-y-6">

              {/* PRIMARY ACTION CARD */}
              <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-[0_20px_50px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col items-center text-center relative overflow-hidden">
                {/* Decorative background flare */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${isPharmacy ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-lg ${isPharmacy ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30'}`}>
                  <MessageSquare size={32} />
                </div>

                <h3 className="text-xl font-extrabold mb-2 text-slate-900 dark:text-white">Need to reach us?</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-6">Start a live chat to ask about availability, pricing, or book an appointment directly.</p>

                {chatError && (
                  <div className="w-full bg-rose-50 text-rose-700 text-xs font-bold p-3 rounded-xl mb-4 border border-rose-200">
                    {chatError}
                  </div>
                )}

                <button
                  onClick={handleStartChat}
                  disabled={chatLoading || chatSession}
                  className={`w-full py-4 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-xl text-white ${chatLoading || chatSession
                    ? 'bg-slate-400 cursor-not-allowed shadow-none hover:translate-y-0'
                    : isPharmacy ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                >
                  {chatLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Connecting...</>
                  ) : chatSession ? (
                    "Chat Opened"
                  ) : (
                    <>Start Live Chat <ChevronLeft size={18} className="rotate-180" /></>
                  )}
                </button>

                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                  <a href={`tel:${facility.contact_phone}`} className="flex items-center justify-center gap-2 py-3 bg-[#F6F9FC] dark:bg-gray-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors ring-1 ring-slate-200 dark:ring-gray-700 text-sm">
                    <Phone size={16} /> Call
                  </a>
                  <button onClick={openInMaps} className="flex items-center justify-center gap-2 py-3 bg-[#F6F9FC] dark:bg-gray-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors ring-1 ring-slate-200 dark:ring-gray-700 text-sm">
                    <Navigation size={16} /> Map
                  </button>
                </div>
              </div>

              {/* WORKING HOURS CARD */}
              <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 dark:ring-white/10">
                <h3 className="font-extrabold text-lg mb-5 flex items-center gap-2">
                  <Clock size={20} className={isPharmacy ? 'text-emerald-500' : 'text-blue-500'} />
                  Business Hours
                </h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const hours = parsedHours?.[day] || [];
                    const isClosed = !hours || hours.length === 0;
                    const isToday = day === today;

                    return (
                      <div key={day} className={`flex justify-between items-center py-2 px-3 rounded-xl ${isToday ? (isPharmacy ? 'bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800' : 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:ring-blue-800') : ''}`}>
                        <span className={`font-bold text-sm ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>{day}</span>
                        <span className={`font-black text-sm ${isClosed ? 'text-rose-500' : (isToday ? (isPharmacy ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400') : 'text-slate-700 dark:text-gray-300')}`}>
                          {isClosed ? 'Closed' : formatDayWorkingHours(hours)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {/* 5. MOBILE FLOATING ACTION BAR (STICKY BOTTOM) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-gray-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={openInMaps}
            className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl font-extrabold text-slate-700 bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Navigation size={20} className="mb-1" />
            <span className="text-[11px] uppercase tracking-wider">Map</span>
          </button>
          <button
            onClick={handleStartChat}
            disabled={chatLoading}
            className={`flex-[1.5] flex flex-col items-center justify-center py-3 rounded-xl font-extrabold text-white shadow-lg transition-transform active:scale-95 ${isPharmacy ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-blue-600 shadow-blue-600/30'}`}
          >
            {chatLoading ? <Loader2 size={24} className="animate-spin" /> : <MessageSquare size={24} className="mb-1" />}
            <span className="text-[11px] uppercase tracking-wider">{chatLoading ? 'Wait' : 'Chat'}</span>
          </button>
          <a
            href={`tel:${facility.contact_phone}`}
            className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl font-extrabold text-slate-700 bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Phone size={20} className="mb-1" />
            <span className="text-[11px] uppercase tracking-wider">Call</span>
          </a>
        </div>
      </div>

    </div>
  );
};

// UI Component Helpers
const ContactRow = ({ icon: Icon, label, value, href, isEmergency, themeColor }) => (
  <div className="flex items-center gap-4 group">
    <div className={`p-3.5 rounded-2xl shrink-0 ${isEmergency ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : (themeColor === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400')} transition-colors`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      {href ? (
        <a href={href} className={`font-extrabold text-lg text-slate-900 dark:text-white hover:underline decoration-2 underline-offset-4 ${isEmergency ? 'decoration-rose-500' : (themeColor === 'emerald' ? 'decoration-emerald-500' : 'decoration-blue-500')}`}>
          {value}
        </a>
      ) : (
        <p className="font-extrabold text-lg text-slate-900 dark:text-white">{value}</p>
      )}
    </div>
  </div>
);

export default FacilityDetailPage;