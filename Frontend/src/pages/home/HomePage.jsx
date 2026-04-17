import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaHospital, FaPills, FaStethoscope, FaFilePrescription,
  FaMapMarkedAlt, FaRobot, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";

// Components
import FloatingChatButton from "../../component/FloatingChatButton";
import Header from "../../component/Header";
import BackToTop from "../../component/BackToTop";
import FacilityGrid from "../../component/FacilityCard";
import HeroSection from "./HomeHeroSection";
import SupportiveCTA from "../../component/SupportiveCTA";
import FAQSection from "../../component/FAQSection";
import { apiGetTopFacilities } from "../../api/hospital";
import { apiFetch } from "../../api/client";
import ResultCard from "../../component/search/ResultCard";

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState([]);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-150px" });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch("/api/admin/stats");
        const stats = [
          { label: "Hospitals", value: res.total_hospitals, icon: <FaHospital /> },
          { label: "Pharmacies", value: res.total_pharmacies, icon: <FaPills /> },
          { label: "Users", value: res.total_users, icon: <FaStethoscope /> },
        ];
        setStats(stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!stats || !isInView) return;
    const duration = 1000;
    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const linear = Math.min(progress / duration, 1);
      const easeOut = 1 - Math.pow(1 - linear, 3);
      const newCounts = stats.map(stat => Math.floor(stat.value * easeOut));
      setCounts(newCounts);
      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [stats, isInView]);

  const offerings = [
    {
      title: t("features.ai_chat.title"),
      desc: t("features.ai_chat.desc"),
      icon: <FaRobot className="text-blue-500" />,
    },
    {
      title: t("features.prescription.title"),
      desc: t("features.prescription.desc"),
      icon: <FaFilePrescription className="text-emerald-500" />,
    },
    {
      title: t("features.navigation.title"),
      desc: t("features.navigation.desc"),
      icon: <FaMapMarkedAlt className="text-orange-500" />,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiGetTopFacilities();
        if (res.success) {
          const all = res?.data || [];

          setHospitals(all.filter(f => f.type === 'hospital').slice(0, 12));
          setPharmacies(all.filter(f => f.type === 'pharmacy').slice(0, 12));
        }
      } catch (error) {
        console.error("Error fetching facilities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (type, query) => {
    const q = (query || "").trim();
    navigate(`/home/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`);
  };
  const handleMapView = () => navigate(`/home/map`);
  const handleDetailView = (facility) => navigate(`/${facility.type}/${facility.id}`);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <HeroSection onSearch={handleHeroSearch} />

        {/* STATS SECTION */}
        <section ref={ref} className="py-12 bg-white dark:bg-gray-950 border-slate-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-150px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {stats == null ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div className="flex items-start gap-4" key={i}>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-1/4 bg-slate-200 dark:bg-gray-700 rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-1/3 bg-slate-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                stats.map((stat, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex items-center justify-center gap-4 p-6">
                    <div className="text-4xl text-blue-600 bg-blue-50 dark:bg-gray-700 p-4 rounded-2xl">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold dark:text-white">{counts[i] || 0}+</h3>
                      <p className="text-slate-500 dark:text-gray-400 font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </section>

        {/* WHAT WE OFFER SECTION */}
        <section className="py-24 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-400 dark:text-white mb-4">{t("features.header")}</h2>
            <div className="w-20 h-1.5 bg-slate-400 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offerings.map((item, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 group transition-colors">
                <div className="text-3xl mb-6 p-4 inline-block bg-slate-50 dark:bg-gray-700 rounded-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-4">{item.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-6">{item.desc}</p>
                <a href="#" className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                  {t("features.learn_more")} <HiOutlineArrowNarrowRight />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TOP FACILITIES SECTION */}
        <section className="py-24 bg-slate-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
          <div className="max-w-[1780px] mx-auto px-6 lg:px-12">

            {/* Hospitals Slider */}
            <div className="mb-20">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-base md:text-3xl font-black text-slate-600 dark:text-white tracking-tight">{t("home.topHospitals")}</h2>
                  <div className="w-12 h-1 bg-blue-400 rounded-full mt-2" />
                </div>
                <button
                  onClick={() => navigate('/home/search?type=hospital')}
                  className="group flex text-sm md:text-base items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  {t("home.viewAll")}
                  <HiOutlineArrowNarrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <FacilitySlider facilities={hospitals} loading={loading} onCardClick={handleDetailView} />
            </div>

            {/* Pharmacies Slider */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-base md:text-3xl font-black text-slate-600 dark:text-white tracking-tight">{t("home.topPharmacies")}</h2>
                  <div className="w-12 h-1 bg-emerald-500 rounded-full mt-2" />
                </div>
                <button
                  onClick={() => navigate('/home/search?type=pharmacy')}
                  className="group flex text-sm md:text-base items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                >
                  {t("home.viewAll")}
                  <HiOutlineArrowNarrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <FacilitySlider facilities={pharmacies} loading={loading} onCardClick={handleDetailView} />
            </div>
          </div>
        </section>

        <SupportiveCTA />
        <FAQSection />

        {/* FOOTER SECTION */}
        <footer className="bg-slat-50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FaHospital className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">Med<span className="text-blue-500">Fi</span>nder</span>
              </div>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">{t("footer.tagline")}</p>
            </div>

            <div>
              <h4 className="font-bold dark:text-white mb-6">{t("footer.columns.platform")}</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600">{t("footer.links.find_hospital")}</a></li>
                <li><a href="#" className="hover:text-blue-600">{t("footer.links.find_pharmacy")}</a></li>
                <li><a href="#" className="hover:text-blue-600">{t("footer.links.ai_chatbot")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold dark:text-white mb-6">{t("footer.columns.support")}</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600">{t("footer.links.help_center")}</a></li>
                <li><a href="#" className="hover:text-blue-600">{t("footer.links.privacy")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold dark:text-white mb-6">{t("footer.columns.feedback")}</h4>
              <div className="flex flex-col gap-y-2">
                <form>
                  <div className="flex flex-col gap-y-2">
                    <input type="email" placeholder={t("footer.email_placeholder")} className="bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-lg outline-none w-full dark:text-white" required />
                    <input type="text" placeholder={t("footer.feedback_placeholder")} className="bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-lg outline-none w-full dark:text-white" required />
                  </div>
                  <div className="flex justify-end">
                    <button className="bg-blue-600 text-white px-4 py-2 w-fit rounded-lg font-bold">{t("footer.feedback_submit_btn")}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="text-center text-slate-400 dark:text-gray-600 text-xs border-t border-slate-50 dark:border-gray-800 pt-8">
            © {new Date().getFullYear()} MedFinder AI. {t("footer.rights")}
          </div>
        </footer>
      </div>
      <FloatingChatButton />
      <BackToTop />
    </>
  );
}

/**
 * Reusable Facility Horizontal Slider
 */
function FacilitySlider({ facilities, loading, onCardClick }) {
  const scrollRef = useRef(null);
  const { t } = useTranslation();
  //console.log(facilities);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - (clientWidth * 0.8) : scrollLeft + (clientWidth * 0.8);
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className='flex gap-4 overflow-x-hidden py-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='min-w-[300px] sm:min-w-[380px] h-[450px] bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-slate-100 dark:border-gray-700' />
        ))}
      </div>
    );
  }

  return (
    <div className='relative group/slider'>
      {/* Scroll Buttons */}
      <button
        type='button'
        onClick={() => scroll('left')}
        className='absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-gray-700 flex items-center justify-center text-slate-600 dark:text-gray-300 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white hidden lg:flex'
      >
        <FaChevronLeft size={14} />
      </button>
      <button
        type='button'
        onClick={() => scroll('right')}
        className='absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-gray-700 flex items-center justify-center text-slate-600 dark:text-gray-300 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white hidden lg:flex'
      >
        <FaChevronRight size={14} />
      </button>

      {/* Slider Track */}
      <div
        ref={scrollRef}
        className='flex gap-4 overflow-x-auto pb-8 pt-2 scroll-smooth no-scrollbar'
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {facilities.map((f) => (
          <div key={`${f.type}-${f.id}`} className='min-w-[300px] sm:min-w-[380px] scroll-snap-align-start transition-transform duration-300 hover:scale-[1.02]'>
            <ResultCard facility={f} onClick={() => onCardClick(f)} />
          </div>
        ))}
        {/* Fillers for empty states */}
        {facilities.length === 0 && (
          <div className='w-full flex justify-center py-20 text-slate-400 font-medium'>
            {t("search.no_results")}
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .scroll-snap-align-start { scroll-snap-align: start; }
      `}</style>
    </div>
  );
}
