import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import AutocompleteInput from "../../component/search/AutocompleteInput";

export default function HeroSection({ onSearch }) {
  const { t } = useTranslation();
  const [type, setType] = useState("hospital");
  const [query, setQuery] = useState("");

  // 1. Create a submit handler
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    onSearch(type, query);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-white dark:bg-gray-950 pt-20">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50/40 dark:bg-emerald-950/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-teal-50/35 dark:bg-teal-950/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-gray-800/80 text-slate-550 dark:text-emerald-400 text-sm sm:text-xs font-bold tracking-widest uppercase mb-6 inline-block border border-slate-100 dark:border-gray-700">
            {t("hero.badge")}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-700 dark:text-white/70 mb-6 leading-[1.1]">
            {t("hero.title_main")} <br />
            <span className="text-gray-600">{t("hero.title_accent")}</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            {t("hero.description")}
          </p>
        </motion.div>

        {/* 2. Change motion.div to motion.form and add onSubmit */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-4xl mx-auto bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-[100_300px_100px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-150 dark:border-gray-800/80 flex flex-col md:flex-row items-stretch gap-2 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/60 transition-all duration-300"
        >
          {/* Type Selector (Change buttons to type="button" so they don't submit the form) */}
          <div className="flex bg-slate-50 border border-slate-100 dark:bg-gray-800/50 dark:border-gray-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType("hospital")}
              className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${type === 'hospital' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-355'}`}
            >
              {t("hero.search_box.tab_hospitals")}
            </button>
            <button
              type="button"
              onClick={() => setType("pharmacy")}
              className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${type === 'pharmacy' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-355'}`}
            >
              {t("hero.search_box.tab_pharmacies")}
            </button>
            <button
              type="button"
              onClick={() => setType("drug")}
              className={`px-4 sm:px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${type === 'drug' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-355'}`}
            >
              🧪 {t("hero.search_box.tab_drugs") || "Drugs"}
            </button>
          </div>

          <div className="flex-1 flex items-center px-4 gap-3">
            {type === 'drug' ? (
              <AutocompleteInput
                className="flex-1 "
                onSearch={(val) => {
                  setQuery(val);
                  onSearch("drug", val);
                }}
                placeholder={t("search.drug_placeholder")}
              />
            ) : (
              <>
                <FaSearch className="text-slate-300" />
                <input
                  type="text"
                  placeholder={t("hero.search_box.placeholder")}
                  className="w-full py-4 bg-transparent outline-none text-slate-700 dark:text-white placeholder:text-slate-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </>
            )}
          </div>

          {/* 3. Ensure this button is type="submit" */}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-102 active:scale-98"
          >
            {t("hero.search_box.button_text")}
          </button>
        </motion.form>
      </div>
    </section>
  );
}