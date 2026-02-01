import {
  FaHospitalSymbol,
  FaPills,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ... (Other imports and variants)


const registrationCards = [
  {
    type: "hospital",
    title: "For Hospital Administrators",
    description:
      "Digitalize your facility's guidance and help patients find your departments instantly through our AI assistant.",
    benefits: [
      "Real-time bed availability",
      "Facility indoor navigation",
      "Emergency emergency routing",
    ],
    icon: <FaHospitalSymbol />,
    color: "blue",
    buttonText: "Register Your Hospital",
  },
  {
    type: "pharmacy",
    title: "For Pharmacy Owners",
    description:
      "List your inventory and allow users to check prescription availability in real-time. Boost your local foot traffic.",
    benefits: [
      "Inventory management tools",
      "Digital prescription verification",
      "Automated stock alerts",
    ],
    icon: <FaPills />,
    color: "emerald",
    buttonText: "Register Your Pharmacy",
  },
];
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};
export default function RegisterPharmacy() {

  const navigate=useNavigate();
  // ... existing code ...
  const handleClick=(type)=>{
  if (type==='pharmacy') {
    const user=localStorage.getItem('user');
    if(!user){
      navigate('/login');
    }else{
      navigate('/register/pharmacy')
    }
  }else if (type==='hospital') {
    const user=localStorage.getItem('user');
    if (!user) {
      navigate("/login");
    }else{

      navigate('/register/hospital')
    }
  }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      {/* ... Hero, Stats, What We Offer, Top Facilities ... */}

      {/* --- NEW REGISTRATION SECTION --- */}
      <section className="py-24 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Are you a Healthcare Provider?
            </h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">
              Join the MedFinder network to improve patient reach, automate
              inquiries, and streamline your facility's digital presence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {registrationCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: card.type === "hospital" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`relative group p-8 lg:p-10 rounded-3xl border-2 transition-all duration-300
                  ${
                    card.color === "blue"
                      ? "border-blue-50 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10"
                      : "border-emerald-50 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                  }`}
              >
                {/* Background Glow */}
                <div
                  className={`absolute -z-10 top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-3xl
                  ${
                    card.color === "blue"
                      ? "bg-blue-400/10"
                      : "bg-emerald-400/10"
                  }`}
                />

                <div className="flex flex-col h-full">
                  <div
                    className={`mb-6 p-4 rounded-2xl inline-flex text-3xl
                    ${
                      card.color === "blue"
                        ? "bg-blue-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {card.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {card.title}
                  </h3>

                  <p className="text-slate-600 dark:text-gray-400 mb-8 leading-relaxed">
                    {card.description}
                  </p>

                  <ul className="space-y-3 mb-10 grow">
                    {card.benefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-gray-300"
                      >
                        <FaCheckCircle
                          className={
                            card.color === "blue"
                              ? "text-blue-500"
                              : "text-emerald-500"
                          }
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95
                    ${
                      card.color === "blue"
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                    }`}
                    onClick={(()=>handleClick(card.type))}
                  >
                    {card.buttonText}
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS (Previously shared) --- */}
      {/* ... */}
    </div>
  );
}
