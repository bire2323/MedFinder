import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaSearch, FaRobot, FaQuestionCircle } from "react-icons/fa";

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-gray-800 last:border-0 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left group transition-all"
      >
        <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors pr-8">
          {question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-180 bg-blue-600 text-white" : "text-slate-400"}`}>
          <FaChevronDown size={14} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p className="pb-8 text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQSection() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const faqItems = t("faqSection.items", { returnObjects: true }) || [];
  const categories = t("faqSection.categories", { returnObjects: true }) || {};

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-24 bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-black mb-6"
          >
            <FaQuestionCircle /> FAQ
          </motion.div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
            {t("faqSection.header")}
          </h2>
          <p className="text-sm sm:text-xl text-slate-500 dark:text-gray-400 font-medium">
            {t("faqSection.subheader")}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-12 space-y-8">
          <div className="relative max-w-2xl mx-auto">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("faqSection.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-gray-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all shadow-xl text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-sm ${
                  activeCategory === key
                    ? "bg-blue-600 text-white shadow-blue-200 dark:shadow-none"
                    : "bg-white dark:bg-slate-950 text-slate-600 dark:text-gray-400 border border-slate-100 dark:border-gray-800 hover:border-blue-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl border border-slate-100 dark:border-gray-800 px-8 lg:px-12 py-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <FAQItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isOpen={activeId === item.id}
                onClick={() => setActiveId(activeId === item.id ? null : item.id)}
              />
            ))
          ) : (
            <div className="py-20 text-center">
               <p className="text-slate-500 dark:text-gray-400 font-bold text-lg">
                 {t("faqSection.noResults")}
               </p>
            </div>
          )}
        </div>

        {/* Bot Integration CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-8 lg:p-12 rounded-[40px] bg-gradient-to-r from-blue-600 to-blue-800 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
               <FaRobot />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-2">Still have questions?</h3>
              <p className="text-blue-100 font-medium">Our AI Healthcare Assistant is here to provide 24/7 personalized support.</p>
            </div>
          </div>
          <button className="bg-white text-blue-700 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl">
             Chat with AI
          </button>
        </motion.div>
      </div>
    </section>
  );
}
