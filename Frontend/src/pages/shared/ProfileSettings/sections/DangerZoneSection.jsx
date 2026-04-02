import { AlertTriangle, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const DangerZoneSection = ({ onDeactivateClick, isDeactivating }) => {
  const { t } = useTranslation();

  return (
    <div id="danger" className="pt-12 mt-12 border-t-2 border-dashed border-red-100 dark:border-red-900/20 scroll-mt-24">
       <div className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-[3rem] border border-red-200 dark:border-red-900/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <AlertTriangle className="text-red-500" size={24} />
                   <h3 className="text-xl font-black uppercase text-red-600 tracking-tight">{t("Settings.DangerZone")}</h3>
                </div>
                <p className="text-sm text-red-700/70 dark:text-red-400 max-w-lg">
                   {t("Settings.DeactivationWarning")}
                </p>
             </div>
             <button 
               onClick={onDeactivateClick}
               disabled={isDeactivating}
               className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-xl shadow-red-500/20 transition-all flex items-center gap-2 group disabled:opacity-50"
             >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                {isDeactivating ? "Processing..." : t("Settings.DeactivateProfile")}
             </button>
          </div>
       </div>
    </div>
  );
};

export const ConfirmDeactivateModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-100 dark:border-red-900/30"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-black text-center mb-2">Are you absolutely sure?</h3>
          <p className="text-slate-500 dark:text-gray-400 text-center text-sm mb-8">
            This action will hide your facility from all patient searches and public maps. You will not receive any new requests.
          </p>
          <div className="flex gap-4">
             <button
               onClick={onClose}
               className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-200 hover:bg-slate-200"
             >
               Cancel
             </button>
             <button
               onClick={onConfirm}
               className="flex-1 py-3 px-4 rounded-xl font-black uppercase text-sm bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20"
             >
               Yes, Deactivate
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DangerZoneSection;
