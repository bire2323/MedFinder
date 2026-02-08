import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Pill, X } from "lucide-react";
import handleKeyDown from "../../hooks/handleKeyDown";
import { useState } from "react";
export default function DrugInventoryModal({
    title,
    drugForm,
    setDrugForm,
    onSubmit,
    onClose,
    isSubmitting,
    submitLabel,
}) {

    const [errors, setErrors] = useState([]);
    const handleChange = (field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setDrugForm({ ...drugForm, [field]: value });
    };

    const validateInput = () => {
        const newErrors = {};
        let isValid = true;

        if (drugForm.brand_name_en.trim() === '') {
            newErrors.brand_name_en = 'this field required';
            isValid = false;
        }

        if (drugForm.brand_name_am.trim() === '') {
            newErrors.brand_name_am = 'this field required';
            isValid = false;
        }

        if (drugForm.genericName.trim() === '') {
            newErrors.genericName = 'this field required';
            isValid = false;
        }
        if (drugForm.about_drug_en.trim() === '') {
            newErrors.about_drug_en = 'this field required';
            isValid = false;
        }
        if (drugForm.about_drug_am.trim() === '') {
            newErrors.about_drug_am = 'this field required';
            isValid = false;
        }
        if (drugForm.expiryDate.trim() === '') {
            newErrors.expiryDate = 'this field required';
            isValid = false;
        }

        if (drugForm.genericName.trim() === '') {
            newErrors.genericName = 'this field required';
            isValid = false;
        }
        if (drugForm.price.trim() === '') {
            newErrors.price = 'this field required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-400 dark:border-gray-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-400 dark:border-gray-500 flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Pill size={20} className="text-emerald-500" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form >
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-x-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Drug Name (english) *</label>
                                <input
                                    type="text"
                                    onKeyDown={handleKeyDown}
                                    value={drugForm.brand_name_en}
                                    onChange={handleChange("brand_name_en")}
                                    placeholder="e.g., Panadol"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                                {errors.brand_name_en && (
                                    <span id="brand_name_error" className="text-[10px] text-red-500 mt-0">
                                        {errors.brand_name_en}
                                    </span>
                                )}
                            </div>
                            <div className="space-x-1 ">
                                <label className="text-xs font-bold text-slate-500 uppercase">Drug Name (አማርኛ) *</label>
                                <input
                                    type="text"
                                    onKeyDown={handleKeyDown}
                                    value={drugForm.brand_name_am}
                                    onChange={handleChange("brand_name_am")}
                                    placeholder="ለምሳሌ፡- ማስታገሻ, "
                                    className="w-full px-4 py-3  bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                                {errors.brand_name_am && (
                                    <span id="brand_name_error" className=" text-[10px] text-red-500 mt-0">
                                        {errors.brand_name_am}
                                    </span>
                                )}
                            </div>
                            <div className="space-x-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Generic Name *</label>
                                <input
                                    type="text"
                                    onKeyDown={handleKeyDown}
                                    value={drugForm.genericName}
                                    onChange={handleChange("genericName")}
                                    placeholder="e.g., Paracetamol"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                                {errors.genericName && (
                                    <span id="brand_name_error" className="text-[10px] text-red-500 mt-0">
                                        {errors.genericName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">

                            <div className="space-x-0">
                                <label className="text-xs font-bold text-slate-500 uppercase">Stock *</label>
                                <input
                                    type="number"
                                    onKeyDown={handleKeyDown}

                                    value={drugForm.stock}
                                    onChange={handleChange("stock")}
                                    placeholder="0"
                                    min="0"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors.stock && (
                                    <span id="brand_name_error" className="text-[10px] text-red-500 mt-0">
                                        {errors.stock}
                                    </span>
                                )}
                            </div>
                            <div className="space-x-0">
                                <label className="text-xs font-bold text-slate-500 uppercase">Price (ETB)</label>
                                <input
                                    type="number"
                                    onKeyDown={handleKeyDown}

                                    value={drugForm.price}
                                    onChange={handleChange("price")}
                                    placeholder="0"
                                    min="0"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors.price && (
                                    <span id="brand_name_error" className="text-[10px] text-red-500 mt-0">
                                        {errors.price}
                                    </span>
                                )}
                            </div>
                            <div className="space-x-0">
                                <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                                <input
                                    type="date"
                                    value={drugForm.expiryDate}
                                    onChange={handleChange("expiryDate")}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors.expiryDate && (
                                    <span id="brand_name_error" className="text-[10px] text-red-500 mt-0">
                                        {errors.expiryDate}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-x-0">
                                <label className="text-xs font-bold text-slate-500 uppercase">about Drug (english) *</label>
                                <textarea

                                    onKeyDown={handleKeyDown}
                                    value={drugForm.about_drug_en}
                                    onChange={handleChange("about_drug_en")}
                                    placeholder="e.g., manufactured in 2025"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors.about_drug_en && (
                                    <span id="brand_name_error" className="text-[10px] text-red-500 mt-0">
                                        {errors.about_drug_en}
                                    </span>
                                )}
                            </div>
                            <div className="space-x-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">about Drug (በአማርኛ)</label>
                                <textarea
                                    onKeyDown={handleKeyDown}
                                    value={drugForm.about_drug_am}
                                    onChange={handleChange("about_drug_am")}
                                    placeholder="e.g.,በ 2025 የተመረተ፣ "
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>


                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                onKeyDown={handleKeyDown}
                                checked={drugForm.rxRequired}
                                onChange={handleChange("rxRequired")}
                                className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-sm">Prescription Required</span>
                        </label>
                    </div>
                </form>
                {/* Actions */}
                <div className="p-4 sm:p-6 border-t border-gray-400 dark:border-gray-500 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (validateInput()) {
                                console.log('ddddddd');
                                onSubmit();
                            }
                        }}

                        disabled={isSubmitting || !drugForm.brand_name_en || !drugForm.brand_name_am || !drugForm.genericName}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing...
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
    );
};
