import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Pill, X, Info, AlertCircle } from "lucide-react";
import handleKeyDown from "../../hooks/handleKeyDown";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
    "Antibiotics", "Pain Relief", "Cardiovascular", "Vitamins",
    "Antidiabetics", "Respiratory", "Gastrointestinal", "Dermatological", "Others"
];

const DOSAGE_FORMS = [
    "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops", "Inhaler", "Others"
];

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
        if (!drugForm.genericName?.trim()) {
            newErrors.genericName = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.price) {
            newErrors.price = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (!drugForm.category) {
            newErrors.category = t("modal.drugInventory.error.required");
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
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <Pill size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">{title}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Form */}
                    <form id="drug-inventory-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Info size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-wider">{t("modal.drugInventory.basicInfo")}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label={t("modal.drugInventory.drugNameEnglish")} error={errors.brand_name_en}>
                                    <input
                                        type="text"
                                        value={drugForm.brand_name_en}
                                        onChange={handleChange("brand_name_en")}
                                        placeholder="Panadol"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <FormField label={t("modal.drugInventory.drugNameAmharic")} error={errors.brand_name_am}>
                                    <input
                                        type="text"
                                        value={drugForm.brand_name_am}
                                        onChange={handleChange("brand_name_am")}
                                        placeholder="ፓናዶል"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                                <div className="md:col-span-2">
                                    <FormField label={t("modal.drugInventory.genericName")} error={errors.genericName}>
                                        <input
                                            type="text"
                                            value={drugForm.genericName}
                                            onChange={handleChange("genericName")}
                                            placeholder="Paracetamol"
                                            className="form-input-premium"
                                            onKeyDown={handleKeyDown}

                                        />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Classification & Manufacturer */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Package size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Classification</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Category" error={errors.category}>
                                    <select value={drugForm.category} onChange={handleChange("category")} className="form-input-premium">
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Dosage Form">
                                    <select value={drugForm.dosage_form} onChange={handleChange("dosage_form")} className="form-input-premium">
                                        <option value="">Select Form</option>
                                        {DOSAGE_FORMS.map(form => <option key={form} value={form}>{form}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Manufacturer">
                                    <input
                                        type="text"
                                        value={drugForm.manufacturer}
                                        onChange={handleChange("manufacturer")}
                                        placeholder="GSK, Bayer, etc."
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                                <FormField label="Batch Number">
                                    <input
                                        type="text"
                                        value={drugForm.batch_number}
                                        onChange={handleChange("batch_number")}
                                        placeholder="BATCH-123456"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Section 3: Pricing & Inventory */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Inventory & Pricing</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField label="Selling Price">
                                    <input
                                        type="number"
                                        value={drugForm.price}
                                        onChange={handleChange("price")}
                                        placeholder="0.00"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                                <FormField label="Cost Price">
                                    <input
                                        type="number"
                                        value={drugForm.cost_price}
                                        onChange={handleChange("cost_price")}
                                        placeholder="0.00"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                                <FormField label="Current Stock">
                                    <input
                                        type="number"
                                        value={drugForm.stock}
                                        onChange={handleChange("stock")}
                                        placeholder="0"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                                <FormField label="Low Stock Alert">
                                    <input
                                        type="number"
                                        value={drugForm.low_stock_threshold}
                                        onChange={handleChange("low_stock_threshold")}
                                        placeholder="10"
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Expiry Date">
                                    <input
                                        type="date"
                                        value={drugForm.expire_date}
                                        onChange={handleChange("expire_date")}
                                        className="form-input-premium"
                                        onKeyDown={handleKeyDown}

                                    />
                                </FormField>
                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={drugForm.rxRequired}
                                                onChange={handleChange("rxRequired")}
                                                className="sr-only"
                                                onKeyDown={handleKeyDown}
                                            />
                                            <div className={`w-12 h-6 rounded-full transition-colors ${drugForm.rxRequired ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}></div>
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${drugForm.rxRequired ? "translate-x-6" : ""}`}></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                                            Prescription Required (Rx)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Descriptions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <AlertCircle size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-wider">About Drug</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Description (EN)">
                                    <textarea
                                        value={drugForm.about_drug_en}
                                        onChange={handleChange("about_drug_en")}
                                        rows={3}
                                        className="form-input-premium resize-none"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <FormField label="Description (AM)">
                                    <textarea
                                        value={drugForm.about_drug_am}
                                        onChange={handleChange("about_drug_am")}
                                        rows={3}
                                        className="form-input-premium resize-none"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="drug-inventory-form"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            {submitLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

const FormField = ({ label, children, error }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">{label}</label>
        {children}
        {error && <p className="text-[10px] font-bold text-red-500 pl-1">{error}</p>}
    </div>
);

const Package = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);