import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch, FaMapMarkedAlt, FaLanguage, FaPills } from "react-icons/fa";

const features = [
  {
    icon: <FaSearch className="text-blue-500" />,
    titleKey: "features.smartSearch.title",
    descKey: "features.smartSearch.desc",
  },
  {
    icon: <FaMapMarkedAlt className="text-emerald-500" />,
    titleKey: "features.navigation.title",
    descKey: "features.navigation.desc",
  },
  {
    icon: <FaLanguage className="text-purple-500" />,
    titleKey: "features.multilingual.title",
    descKey: "features.multilingual.desc",
  },
  {
    icon: <FaPills className="text-rose-500" />,
    titleKey: "features.availability.title",
    descKey: "features.availability.desc",
  },
];

export default function FeatureCarousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 p-6 mb-6 shadow-xl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl opacity-50"></div>

      <div className="relative z-10">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * (100 / features.length)}%)`,
            width: `${features.length * 100}%`
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 flex flex-col items-center justify-center px-4 text-center"
              style={{ width: `${100 / features.length}%` }}
            >
              <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 p-4 sm:p-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm text-white">
                {feature.icon}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight drop-shadow-sm text-center">
                {t(feature.titleKey) || feature.titleKey}
              </h3>
              <p className="text-blue-50 text-sm sm:text-base max-w-lg font-bold leading-relaxed text-center drop-shadow-md">
                {t(feature.descKey) || feature.descKey}
              </p>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center gap-2.5 mt-8">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${current === idx
                  ? "bg-white border-white scale-125 shadow-md"
                  : "bg-gray-400/50 border-transparent hover:bg-gray-300"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
