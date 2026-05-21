import { AlertTriangle, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const DangerZoneSection = ({ onDeactivateClick, isDeactivating }) => {
  const { t } = useTranslation();

  return (
    <div id="danger" className="pt-8 mt-8 border-t border-dashed border-rose-250/20 scroll-mt-24">
       <div className="bg-rose-50/20 dark:bg-rose-950/10 p-6 sm:p-8 rounded-3xl border border-rose-100/50 dark:border-rose-900/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <AlertTriangle className="text-rose-500 animate-pulse" size={20} />
                   <h3 className="text-sm font-black uppercase text-rose-600 tracking-wider">{t("Settings.DangerZone")}</h3>
                </div>
                <p className="text-xs text-rose-700/70 dark:text-rose-450 font-semibold leading-relaxed max-w-lg">
                   {t("Settings.DeactivationWarning")}
                </p>
             </div>
             <button 
               onClick={onDeactivateClick}
               disabled={isDeactivating}
               className="bg-rose-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-rose-700 shadow-lg shadow-rose-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group disabled:opacity-50 cursor-pointer"
             >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800/80"
        >
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 group hover:rotate-0 transition-transform duration-500 border border-rose-100/50">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-center text-slate-800 dark:text-white leading-tight mb-2">Are you absolutely sure?</h3>
          <p className="text-slate-400 dark:text-slate-550 text-center text-xs font-semibold leading-relaxed mb-8">
            This action will hide your facility from all patient searches and public maps. You will not receive any new requests.
          </p>
          <div className="flex gap-4">
             <button
               onClick={onClose}
               className="flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-350 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
             >
               Cancel
             </button>
             <button
               onClick={onConfirm}
               className="flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/10 active:scale-95 transition-all cursor-pointer"
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
