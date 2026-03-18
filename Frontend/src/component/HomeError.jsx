import { useRouteError, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FiRefreshCw, FiHome, FiAlertCircle } from "react-icons/fi";

export default function HomeError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isServerError = error.status === 500;

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-100 dark:bg-red-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-800 text-center"
      >
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-4xl">
          <FiAlertCircle />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          {t("error.title")}
        </h2>
        
        <p className="text-slate-500 dark:text-gray-400 mb-8 leading-relaxed">
          {isServerError ? t("error.server_error") : t("error.generic_error")}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <FiRefreshCw className="text-lg" />
            {t("error.retry_btn")}
          </button>

          <button 
            onClick={() => navigate("/")} 
            className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-white py-3.5 rounded-xl font-bold transition-all"
          >
            <FiHome className="text-lg" />
            {t("error.home_btn")}
          </button>
        </div>

        {/* Technical Detail (Subtle) */}
        <p className="mt-8 text-[10px] uppercase tracking-widest text-slate-300 dark:text-gray-600 font-medium">
          Error Code: {error.status || "Unknown"}
        </p>
      </motion.div>
    </div>
  );
}