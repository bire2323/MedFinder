import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, Building2, Stethoscope, Tag, Globe } from "lucide-react";
import handleKeyDown from "./../../../hooks/handleKeyDown";

const HospitalInventoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  type, // "department" or "service"
  formData,
  setFormData,
  isSubmitting,
  title
}) => {
  if (!isOpen) return null;

  const isDept = type === "department";

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, is_available: e.target.checked });
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 pb-4 sm:pb-5">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl hover:rotate-90 transition-all duration-300 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/30 shrink-0">
                {isDept ? <Building2 size={24} /> : <Stethoscope size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-805 dark:text-white leading-tight">
                  {title}
                </h2>
                <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs mt-0.5">
                  {isDept ? "Organize your hospital specialized units." : "Manage medical services provided to patients."}
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="p-6 sm:p-8 pt-2 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* English Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    <Globe size={12} className="text-blue-500" />
                    {isDept ? "Department Name (EN)" : "Service Name (EN)"}
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleKeyDown}
                    value={isDept ? formData.department_name_en : formData.service_name_en}
                    onChange={(e) => setFormData({ ...formData, [isDept ? "department_name_en" : "service_name_en"]: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs text-slate-705 dark:text-white"
                    placeholder={isDept ? "e.g. Cardiology" : "e.g. Heart Surgery"}
                  />
                </div>

                {/* Amharic Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    <Globe size={12} className="text-rose-500" />
                    {isDept ? "Department Name (AM)" : "Service Name (AM)"}
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleKeyDown}
                    value={isDept ? formData.department_name_am : formData.service_name_am}
                    onChange={(e) => setFormData({ ...formData, [isDept ? "department_name_am" : "service_name_am"]: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs text-slate-705 dark:text-white"
                    placeholder={isDept ? "ጠቅላላ ሕክምና" : "የልብ ቀዶ ጥገና"}
                  />
                </div>

                {/* English Category */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    <Tag size={12} className="text-blue-500" />
                    Category (EN)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleKeyDown}
                    value={isDept ? formData.department_category_name_en : formData.service_category_name_en}
                    onChange={(e) => setFormData({ ...formData, [isDept ? "department_category_name_en" : "service_category_name_en"]: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs text-slate-705 dark:text-white"
                    placeholder="e.g. Surgical"
                  />
                </div>

                {/* Amharic Category */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    <Tag size={12} className="text-rose-500" />
                    Category (AM)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleKeyDown}
                    value={isDept ? formData.department_category_name_am : formData.service_category_name_am}
                    onChange={(e) => setFormData({ ...formData, [isDept ? "department_category_name_am" : "service_category_name_am"]: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs text-slate-705 dark:text-white"
                    placeholder="e.g. ቀዶ ጥገና"
                  />
                </div>
              </div>

              {!isDept && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                    <input
                      type="checkbox"
                      id="is_available"
                      onKeyDown={handleKeyDown}
                      checked={formData.is_available}
                      onChange={handleCheckboxChange}
                      className="w-4.5 h-4.5 rounded text-blue-600 dark:text-blue-550 border-slate-250 focus:ring-blue-500/20 shrink-0 cursor-pointer"
                    />
                    <label htmlFor="is_available" className="text-xs font-bold text-slate-650 dark:text-slate-350 cursor-pointer selection:bg-transparent">
                      Service is currently active and available
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Notes (Description)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs text-slate-705 dark:text-white min-h-[90px]"
                      placeholder="Additional details about this service..."
                    />
                  </div>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl font-black text-white text-xs uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/10 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {formData.id ? "Update Changes" : "Save and Post"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HospitalInventoryModal;
