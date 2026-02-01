import FloatingChatButton from "../../component/FloatingChatButton";
import Header from "../../component/Header";
import BackToTop from "../../component/BackToTop";

import { apiAddDepartment,apiGetHospitals,apiGetPharmacies } from "../../api/hospital";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaHospital,
  FaPills,
  FaSearch,
  FaStethoscope,
  FaFilePrescription,
  FaMapMarkedAlt,
  FaRobot,
  FaStar,
} from "react-icons/fa";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import RegisterPharmacy from "../../component/RegisterPharmacy";

// --- Mock Data ---
const stats = [
  { label: "Partner Hospitals", value: "850+", icon: <FaHospital /> },
  { label: "Certified Pharmacies", value: "1,200+", icon: <FaPills /> },
  { label: "Active Users", value: "50k+", icon: <FaStethoscope /> },
];

const offerings = [
  {
    title: "AI Symptom Checker",
    desc: "Describe your symptoms to our integrated chatbot for instant preliminary guidance.",
    icon: <FaRobot className="text-blue-500" />,
  },
  {
    title: "Prescription Verifier",
    desc: "Upload or type your prescription to check availability in nearby pharmacies.",
    icon: <FaFilePrescription className="text-emerald-500" />,
  },
  {
    title: "Real-time Navigation",
    desc: "Get turn-by-turn directions to the nearest healthcare facility with live traffic.",
    icon: <FaMapMarkedAlt className="text-orange-500" />,
  },
];

const topFacilities = [
  {
    id: 1,
    name: "St. Paul City Hospital",
    type: "Hospital",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1587350859728-117699f4a13d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Central Wellness Pharmacy",
    type: "Pharmacy",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "General Med Center",
    type: "Hospital",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=300&q=80",
  },
];

// --- Animation Variants ---
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

  
 apiGetHospitals().then((res)=>{
  if (res.success) {
    
    console.log((res.data));
  }else{
    console.log('not');
    
  }
})
//console.log(res.data);

apiGetPharmacies().then((res)=>{
if (res.success) {
  
  console.log((res.data));
}else{
  console.log('not');
  
}
})






export default function HomePage() {
  const [searchType, setSearchType] = useState("hospital");
  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        {/* 1. HERO & SEARCH SECTION */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
                Find Care <span className="text-blue-600">Instantly</span>,{" "}
                <br />
              </h1>
              <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
                Your intelligent companion for locating hospitals and
                pharmacies. Integrated with AI for symptoms, prescriptions, and
                facility guidance.
              </p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex bg-slate-100 dark:bg-gray-700 rounded-xl p-1">
                  <button
                    onClick={() => setSearchType("hospital")}
                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition ${
                      searchType === "hospital"
                        ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Hospitals
                  </button>
                  <button
                    onClick={() => setSearchType("pharmacy")}
                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition ${
                      searchType === "pharmacy"
                        ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Pharmacies
                  </button>
                </div>
                <div className="flex-1 flex items-center px-4 gap-3 bg-slate-50 dark:bg-gray-700 rounded-xl border dark:border-gray-600">
                  <FaSearch className="text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${searchType} by name or location...`}
                    className="bg-transparent w-full py-4 outline-none text-slate-700 dark:text-white"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95">
                  Search Now
                </button>
              </div>
            </motion.div>
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50" />
        </section>

        {/* 2. STATS SECTION */}
        <section className="py-12 bg-white dark:bg-gray-800 border-y border-slate-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              variants={staggerContainer}
              whileInView="animate"
              initial="initial"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center justify-center gap-4 p-6"
                >
                  <div className="text-4xl text-blue-600 bg-blue-50 dark:bg-gray-700 p-4 rounded-2xl">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold dark:text-white">
                      {stat.value}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3. WHAT WE OFFER SECTION */}
        <section className="py-24 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold dark:text-white mb-4">
              Smart Healthcare Features
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offerings.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-gray-700 group transition-colors"
              >
                <div className="text-3xl mb-6 p-4 inline-block bg-slate-50 dark:bg-gray-700 rounded-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                  {item.desc}
                </p>
                <a
                  href="#"
                  className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all"
                >
                  Learn More <HiOutlineArrowNarrowRight />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. TOP FACILITIES SECTION */}
        <section className="py-24 bg-slate-100 dark:bg-gray-800/50 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold dark:text-white">
                  Top Rated Facilities
                </h2>
                <p className="text-slate-500 dark:text-gray-400">
                  Handpicked hospitals and pharmacies based on user feedback.
                </p>
              </div>
              <button className="hidden md:block text-blue-600 font-bold border-b-2 border-blue-600">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {topFacilities.map((facility) => (
                <motion.div
                  key={facility.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-gray-700"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
                      <FaStar className="text-yellow-400" /> {facility.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <span
                      className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded ${
                        facility.type === "Hospital"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {facility.type}
                    </span>
                    <h3 className="text-lg font-bold mt-3 dark:text-white">
                      {facility.name}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Open 24/7 • 2.4 miles away
                    </p>
                    <button className="w-full mt-6 py-3 bg-slate-50 dark:bg-gray-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-white rounded-xl font-bold transition-colors">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <RegisterPharmacy />
        {/* 5. TESTIMONIALS */}
        {/* <section className="py-24 max-w-[93%] md:max-w-[98%] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold dark:text-white mb-16">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-blue-500 dark:bg-gray-800 p-6 rounded-3xl text-left text-white shadow-xl"
              >
                <p className="text-lg italic mb-6">
                  "The AI chatbot helped me find a pharmacy that actually had my
                  rare prescription in stock at 2 AM. Saved me so much stress!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-400 rounded-full" />
                  <div>
                    <h4 className="font-bold">Abebe Kebede</h4>
                    <p className="text-blue-200 text-sm">Addis Ababa, User</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* 6. FOOTER */}
        <footer className="bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FaHospital className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Med<span className="text-blue-500">Fi</span>nder
                </span>
              </div>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                Making healthcare accessible through technology. Find the right
                care at the right time.
              </p>
            </div>
            <div>
              <h4 className="font-bold dark:text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Find Hospital
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Find Pharmacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    AI Chatbot
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold dark:text-white mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold dark:text-white mb-6">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Email"
                  className="bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-lg outline-none w-full dark:text-white"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="text-center text-slate-400 dark:text-gray-600 text-xs border-t border-slate-50 dark:border-gray-800 pt-8">
            © {new Date().getFullYear()} MedFinder AI. All rights reserved.
          </div>
        </footer>
      </div>
      <FloatingChatButton />
      <BackToTop />
    </>
  );
}
