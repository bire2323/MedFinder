import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaHospitalAlt, FaStore, FaArrowRight, FaHandshake } from "react-icons/fa";
import useAuthStore from "../store/UserAuthStore";

export default function SupportiveCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleRegister = (type) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/register/${type}`);
    }
  };

  const cards = [
    {
      type: "hospital",
      title: t("supportiveCTA.hospital.title"),
      description: t("supportiveCTA.hospital.description"),
      btnText: t("supportiveCTA.hospital.button"),
      benefits: t("supportiveCTA.hospital.benefits", { returnObjects: true }) || [],
      icon: <FaHospitalAlt />,
      color: "blue",
      hoverIcon: <FaHandshake />,
    },
    {
      type: "pharmacy",
      title: t("supportiveCTA.pharmacy.title"),
      description: t("supportiveCTA.pharmacy.description"),
      btnText: t("supportiveCTA.pharmacy.button"),
      benefits: t("supportiveCTA.pharmacy.benefits", { returnObjects: true }) || [],
      icon: <FaStore />,
      color: "emerald",
      hoverIcon: <FaArrowRight />,
    },
  ];

  return (
    <section className="py-10 sm:py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-[1780px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-2xl md:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6"
          >
            {t("supportiveCTA.header")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-xl text-slate-500 dark:text-gray-400 max-w-3xl mx-auto font-medium"
          >
            {t("supportiveCTA.subheader")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, x: idx === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className={`relative overflow-hidden group p-6 sm:p-10 lg:p-14 rounded-[40px] border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900/50 shadow-2xl transition-all duration-300`}
            >
              {/* Decorative Background Blob */}
              <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full transition-transform duration-700 group-hover:scale-150 ${card.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
                }`} />

              <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-3">
                 <div className={`w-15 h-15 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-inner transition-transform duration-500 group-hover:rotate-[15deg] ${card.color === 'blue' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                  {card.icon}
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6">
                  {card.title}
                </h3>
               </div>

                <p className="text-sm sm:text-lg text-slate-600 dark:text-gray-400 mb-8 leading-relaxed font-bold">
                  {card.description}
                </p>

                {/* Benefits List */}
                <ul className="space-y-4 mb-10 grow">
                  {card.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-gray-300 font-bold">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${card.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                        }`}>
                        ✓
                      </div>
                     <span className="text-sm sm:text-lg">{benefit}</span> 
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleRegister(card.type)}
                  className={`mt-auto w-full sm:w-fit px-5 sm:px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${card.color === 'blue'
                    ? 'bg-blue-600 hover:bg-black dark:hover:bg-blue-400 text-white hover:shadow-blue-500/20'
                    : 'bg-emerald-600 hover:bg-black dark:hover:bg-emerald-400 text-white hover:shadow-emerald-500/20'
                    }`}
                >
                  {card.btnText}
                  <span className="transition-transform duration-300 group-hover:translate-x-2">
                    {card.hoverIcon}
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
