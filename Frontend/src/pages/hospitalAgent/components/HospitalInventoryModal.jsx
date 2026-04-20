import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, Building2, Stethoscope, Tag, Globe } from "lucide-react";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-10 pb-6">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-gray-700 rounded-2xl hover:rotate-90 transition-all duration-300"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-4 rounded-3xl ${isDept ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
              {isDept ? <Building2 size={32} /> : <Stethoscope size={32} />}
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                {title}
              </h2>
              <p className="text-slate-400 font-bold">
                {isDept ? "Organize your hospital specialized units." : "Manage medical services provided to patients."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-10 pb-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                <Globe size={14} className="text-blue-500" />
                {isDept ? "Department Name (EN)" : "Service Name (EN)"}
              </label>
              <input
                type="text"
                value={isDept ? formData.department_name_en : formData.service_name_en}
                onChange={(e) => setFormData({ ...formData, [isDept ? "department_name_en" : "service_name_en"]: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none transition-all font-bold"
                placeholder={isDept ? "e.g. Cardiology" : "e.g. Heart Surgery"}
              />
            </div>

            {/* Amharic Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                <Globe size={14} className="text-red-500" />
                {isDept ? "Department Name (AM)" : "Service Name (AM)"}
              </label>
              <input
                type="text"
                value={isDept ? formData.department_name_am : formData.service_name_am}
                onChange={(e) => setFormData({ ...formData, [isDept ? "department_name_am" : "service_name_am"]: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none transition-all font-bold"
                placeholder={isDept ? "ጠቅላላ ሕክምና" : "የልብ ቀዶ ጥገና"}
              />
            </div>

            {/* English Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                <Tag size={14} className="text-blue-500" />
                Category (EN)
              </label>
              <input
                type="text"
                value={isDept ? formData.department_category_name_en : formData.service_category_name_en}
                onChange={(e) => setFormData({ ...formData, [isDept ? "department_category_name_en" : "service_category_name_en"]: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none transition-all font-bold"
                placeholder="e.g. Surgical"
              />
            </div>

            {/* Amharic Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                <Tag size={14} className="text-red-500" />
                Category (AM)
              </label>
              <input
                type="text"
                value={isDept ? formData.department_category_name_am : formData.service_category_name_am}
                onChange={(e) => setFormData({ ...formData, [isDept ? "department_category_name_am" : "service_category_name_am"]: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none transition-all font-bold"
                placeholder="e.g. ቀዶ ጥገና"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`w-full py-5 rounded-[2rem] font-black text-white text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isDept ? "bg-blue-600 shadow-blue-500/30 hover:bg-blue-700" : "bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-700"
              } disabled:opacity-50`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              {formData.id ? "Update Changes" : "Save and Post"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HospitalInventoryModal;
