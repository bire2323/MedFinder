import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Pill, X } from "lucide-react";
import handleKeyDown from "../../hooks/handleKeyDown";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function DrugInventoryModal({
    title,
    drugForm,
    setDrugForm,
    onSubmit,
    onClose,
    isSubmitting,
    submitLabel,
}) {
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});

    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleChange = (field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setDrugForm({ ...drugForm, [field]: value });

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateInput = () => {
        const newErrors = {};
        let isValid = true;

        if (!drugForm.brand_name_en?.trim()) {
            newErrors.brand_name_en = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.brand_name_am?.trim()) {
            newErrors.brand_name_am = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.genericName?.trim()) {
            newErrors.genericName = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.about_drug_en?.trim()) {
            newErrors.about_drug_en = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.expiryDate?.trim()) {
            newErrors.expiryDate = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.price?.trim()) {
            newErrors.price = t("modal.drugInventory.error.required");
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateInput()) {
            onSubmit();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}                     // ← close on backdrop click
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="
            bg-white dark:bg-gray-800 
            rounded-2xl sm:rounded-3xl 
            shadow-2xl shadow-black/40
            w-full max-w-lg 
            max-h-[90vh] 
            overflow-hidden 
            flex flex-col
            border border-gray-300/50 dark:border-gray-600
          "
                    onClick={(e) => e.stopPropagation()}   // ← prevent close when clicking inside
                >
                    {/* Sticky Header */}
                    <div
                        className="
              p-5 sm:p-6 
              border-b border-gray-200 dark:border-gray-700 
              flex items-center justify-between 
              sticky top-0 
              bg-white dark:bg-gray-800 
              z-10
            "
                    >
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Pill size={22} className="text-emerald-500" />
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-5 sm:p-6 space-y-6">
                            {/* English & Amharic name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.drugNameEnglish")}
                                    </label>
                                    <input
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        value={drugForm.brand_name_en}
                                        onChange={handleChange("brand_name_en")}
                                        placeholder={t("modal.drugInventory.placeholder.drugNameEn")}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    {errors.brand_name_en && <p className="text-xs text-red-600 mt-1.5">{errors.brand_name_en}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.drugNameAmharic")}
                                    </label>
                                    <input
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        value={drugForm.brand_name_am}
                                        onChange={handleChange("brand_name_am")}
                                        placeholder={t("modal.drugInventory.placeholder.drugNameAm")}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    {errors.brand_name_am && <p className="text-xs text-red-600 mt-1.5">{errors.brand_name_am}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.genericName")}
                                    </label>
                                    <input
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        value={drugForm.genericName}
                                        onChange={handleChange("genericName")}
                                        placeholder={t("modal.drugInventory.placeholder.genericName")}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    {errors.genericName && <p className="text-xs text-red-600 mt-1.5">{errors.genericName}</p>}
                                </div>
                            </div>

                            {/* Stock, Price, Expiry */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.stock")}
                                    </label>
                                    <input
                                        type="number"
                                        value={drugForm.stock}
                                        onChange={handleChange("stock")}
                                        placeholder={t("modal.drugInventory.placeholder.stock")}
                                        min="0"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.price")}
                                    </label>
                                    <input
                                        type="number"
                                        value={drugForm.price}
                                        onChange={handleChange("price")}
                                        placeholder={t("modal.drugInventory.placeholder.price")}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    {errors.price && <p className="text-xs text-red-600 mt-1.5">{errors.price}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.expiryDate")}
                                    </label>
                                    <input
                                        type="date"
                                        value={drugForm.expiryDate}
                                        onChange={handleChange("expiryDate")}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    {errors.expiryDate && <p className="text-xs text-red-600 mt-1.5">{errors.expiryDate}</p>}
                                </div>
                            </div>

                            {/* About */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.aboutDrugEnglish")}
                                    </label>
                                    <textarea
                                        value={drugForm.about_drug_en}
                                        onChange={handleChange("about_drug_en")}
                                        placeholder={t("modal.drugInventory.placeholder.aboutEn")}
                                        rows={4}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
                                    />
                                    {errors.about_drug_en && <p className="text-xs text-red-600 mt-1.5">{errors.about_drug_en}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5 tracking-wide">
                                        {t("modal.drugInventory.aboutDrugAmharic")}
                                    </label>
                                    <textarea
                                        value={drugForm.about_drug_am}
                                        onChange={handleChange("about_drug_am")}
                                        placeholder={t("modal.drugInventory.placeholder.aboutAm")}
                                        rows={4}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-gray-700/70 rounded-xl border border-slate-200 dark:border-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={drugForm.rxRequired}
                                    onChange={handleChange("rxRequired")}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t("modal.drugInventory.prescriptionRequired")}
                                </span>
                            </label>
                        </div>
                    </form>

                    {/* Sticky Footer */}
                    <div
                        className="
              p-5 sm:p-6 
              border-t border-gray-200 dark:border-gray-700 
              flex justify-end gap-4 
              sticky bottom-0 
              bg-white dark:bg-gray-800 
              z-10
            "
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-7 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
                        >
                            {t("modal.drugInventory.actions.cancel")}
                        </button>

                        <button
                            type="submit"
                            form="drug-form" // optional: if you give form id="drug-form"
                            onClick={() => {
                                if (validateInput()) onSubmit();
                            }}
                            disabled={isSubmitting}
                            className="px-7 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {t("modal.drugInventory.actions.processing")}
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    {submitLabel}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}