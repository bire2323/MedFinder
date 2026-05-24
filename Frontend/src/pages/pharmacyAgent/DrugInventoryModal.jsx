import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Pill, X, Info, AlertCircle } from "lucide-react";
import handleKeyDown from "../../hooks/handleKeyDown";
import { useState, useEffect, useCallback, useRef } from "react";
import { formatInventoryDate } from "../../utils/inventoryHelpers";
import { apiGetDrugMetadataAll } from "../../api/inventory";
import { useTranslation } from "react-i18next";

const METADATA_CACHE_KEY = "pharmacyInventoryDrugMetadata";
const METADATA_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
    mode = "add",
    batches = [],
}) {
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});
    const [metadataCache, setMetadataCache] = useState({ category: [], brand: [], brandAm: [], generic: [] });
    const [metadataSuggestions, setMetadataSuggestions] = useState({ category: [], brand: [], generic: [] });
    const [loadingMetadata, setLoadingMetadata] = useState({ category: false, brand: false, generic: false });
    const [showSuggestions, setShowSuggestions] = useState({ category: false, brand: false, generic: false });
    const modalRef = useRef(null);

    const getExpireMin = (manufactureDate) => {
        if (!manufactureDate) {
            return "";
        }
        const date = new Date(manufactureDate);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split("T")[0];
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const loadMetadataCacheFromStorage = () => {
        try {
            const raw = localStorage.getItem(METADATA_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.cachedAt) return null;
            if (Date.now() - parsed.cachedAt > METADATA_CACHE_TTL_MS) {
                localStorage.removeItem(METADATA_CACHE_KEY);
                return null;
            }
            return parsed.data;
        } catch (error) {
            console.warn("Failed to read metadata cache:", error);
            return null;
        }
    };

    const saveMetadataCacheToStorage = (data) => {
        try {
            localStorage.setItem(
                METADATA_CACHE_KEY,
                JSON.stringify({ cachedAt: Date.now(), data })
            );
        } catch (error) {
            console.warn("Failed to write metadata cache:", error);
        }
    };

    const filterSuggestions = useCallback((type, query = "") => {
        const items = metadataCache[type] || [];
        const normalized = query?.trim().toLowerCase();
        if (!normalized) {
            return items.slice(0, 20);
        }
        return items.filter((item) => item?.toLowerCase().includes(normalized)).slice(0, 20);
    }, [metadataCache]);

    const updateSuggestions = useCallback((type, query = "") => {
        setMetadataSuggestions((prev) => ({ ...prev, [type]: filterSuggestions(type, query) }));
    }, [filterSuggestions]);

    const loadMetadataCache = useCallback(async () => {
        const cached = loadMetadataCacheFromStorage();
        if (cached) {
            setMetadataCache(cached);
            return;
        }

        setLoadingMetadata({ category: true, brand: true, generic: true });
        try {
            const response = await apiGetDrugMetadataAll();
            const payload = response?.data || {};
            const cache = {
                brand: payload.brand_names_en || [],
                brandAm: payload.brand_names_am || [],
                generic: payload.generic_names || [],
                category: payload.categories || [],
            };
            setMetadataCache(cache);
            saveMetadataCacheToStorage(cache);
        } catch (error) {
            console.error("Failed to load drug metadata cache:", error);
        } finally {
            setLoadingMetadata({ category: false, brand: false, generic: false });
        }
    }, []);

    useEffect(() => {
        loadMetadataCache();
    }, [loadMetadataCache]);

    useEffect(() => {
        updateSuggestions("category", drugForm.category || "");
    }, [drugForm.category, updateSuggestions]);

    useEffect(() => {
        const timeout = setTimeout(() => updateSuggestions("brand", drugForm.brand_name_en || ""), 150);
        return () => clearTimeout(timeout);
    }, [drugForm.brand_name_en, updateSuggestions]);

    useEffect(() => {
        const timeout = setTimeout(() => updateSuggestions("generic", drugForm.genericName || ""), 150);
        return () => clearTimeout(timeout);
    }, [drugForm.genericName, updateSuggestions]);

    useEffect(() => {
        if (!metadataCache.brand.length && !metadataCache.generic.length && !metadataCache.category.length) {
            return;
        }

        updateSuggestions("category", drugForm.category || "");
        updateSuggestions("brand", drugForm.brand_name_en || "");
        updateSuggestions("generic", drugForm.genericName || "");
    }, [metadataCache, drugForm.category, drugForm.brand_name_en, drugForm.genericName, updateSuggestions]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowSuggestions({ category: false, brand: false, generic: false });
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const applyBatchToForm = useCallback((batchId) => {
        if (!batchId || !batches?.length) return;
        const b = batches.find((x) => String(x.batch_inventory_id) === String(batchId));
        if (!b) return;
        setDrugForm((prev) => ({
            ...prev,
            batch_inventory_id: b.batch_inventory_id,
            stock: b.available,
            price: b.price,
            cost_price: b.cost ?? prev.cost_price,
            expire_date: formatInventoryDate(b.expiration_date),
            manufacture_date: b.manufacture_date ? formatInventoryDate(b.manufacture_date) : "",
            batch_number: b.batch_number,
            manufacturer: b.manufacturer ?? prev.manufacturer,
            category: b.category ?? prev.category,
            dosage_form: b.dosage_form ?? prev.dosage_form,
        }));
    }, [batches, setDrugForm]);

    const handleChange = (field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        if (field === "batch_inventory_id") {
            if (!value) {
                setDrugForm((prev) => ({ ...prev, batch_inventory_id: null }));
            } else {
                applyBatchToForm(value);
            }
            return;
        }

        if (field === "manufacture_date") {
            const dateValue = value;
            const nextExpire = drugForm.expire_date && drugForm.expire_date <= dateValue ? "" : drugForm.expire_date;
            setDrugForm((prev) => ({
                ...prev,
                manufacture_date: dateValue,
                expire_date: nextExpire,
            }));
            if (errors.manufacture_date || errors.expire_date) {
                setErrors((prev) => ({ ...prev, manufacture_date: undefined, expire_date: undefined }));
            }
            return;
        }

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
        if (!drugForm.expire_date) {
            newErrors.expire_date = t("modal.drugInventory.error.required");
            isValid = false;
        }
        if (drugForm.manufacture_date && drugForm.expire_date && drugForm.expire_date <= drugForm.manufacture_date) {
            newErrors.expire_date = "Expiry date must be after manufacture date";
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
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-800/80"
                    onClick={(e) => e.stopPropagation()}
                    ref={modalRef}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-450 border border-emerald-500/10">
                                <Pill size={22} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                                {mode === "add" && (
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                        Creates a new batch — existing batches stay separate
                                    </p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                            <X size={20} className="text-slate-400 dark:text-slate-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form id="drug-inventory-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 pb-2 border-b border-slate-50 dark:border-slate-800/30">
                                <Info size={16} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">{t("modal.drugInventory.basicInfo")}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Batch Number">
                                    <input
                                        type="text"
                                        value={drugForm.batch_number}
                                        onChange={handleChange("batch_number")}
                                        placeholder="BATCH-123456"
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <FormField label={t("modal.drugInventory.drugNameEnglish")} error={errors.brand_name_en}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={drugForm.brand_name_en}
                                            onChange={(e) => {
                                                handleChange("brand_name_en")(e);
                                                setShowSuggestions((prev) => ({ ...prev, brand: true }));
                                            }}
                                            onFocus={() => setShowSuggestions((prev) => ({ ...prev, brand: true }))}
                                            placeholder="Panadol"
                                            className="form-input-premium font-bold tracking-wide"
                                            onKeyDown={handleKeyDown}
                                        />
                                        {showSuggestions.brand && metadataSuggestions.brand.length > 0 && (
                                            <div className="absolute z-50 mt-1 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                                {loadingMetadata.brand ? (
                                                    <div className="p-3 text-sm text-slate-500">Loading...</div>
                                                ) : metadataSuggestions.brand.map((item, index) => (
                                                    <button
                                                        key={`brand-suggestion-${index}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setDrugForm((prev) => ({ ...prev, brand_name_en: item }));
                                                            setShowSuggestions((prev) => ({ ...prev, brand: false }));
                                                        }}
                                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormField>
                                <FormField label={t("modal.drugInventory.drugNameAmharic")} error={errors.brand_name_am}>
                                    <input
                                        type="text"
                                        value={drugForm.brand_name_am}
                                        onChange={handleChange("brand_name_am")}
                                        placeholder="ፓናዶል"
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <div className="hidden md:block" />
                                <div className="md:col-span-2">
                                    <FormField label={t("modal.drugInventory.genericName")} error={errors.genericName}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={drugForm.genericName}
                                                onChange={(e) => {
                                                    handleChange("genericName")(e);
                                                    setShowSuggestions((prev) => ({ ...prev, generic: true }));
                                                }}
                                                onFocus={() => setShowSuggestions((prev) => ({ ...prev, generic: true }))}
                                                placeholder="Paracetamol"
                                                className="form-input-premium font-bold tracking-wide"
                                                onKeyDown={handleKeyDown}
                                            />
                                            {showSuggestions.generic && metadataSuggestions.generic.length > 0 && (
                                                <div className="absolute z-50 mt-1 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                                    {loadingMetadata.generic ? (
                                                        <div className="p-3 text-sm text-slate-500">Loading...</div>
                                                    ) : metadataSuggestions.generic.map((item, index) => (
                                                        <button
                                                            key={`generic-suggestion-${index}`}
                                                            type="button"
                                                            onClick={() => {
                                                                setDrugForm((prev) => ({ ...prev, genericName: item }));
                                                                setShowSuggestions((prev) => ({ ...prev, generic: false }));
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Classification & Manufacturer */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 pb-2 border-b border-slate-50 dark:border-slate-800/30">
                                <PackageIcon size={16} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Classification & Source</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Category" error={errors.category}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={drugForm.category || ""}
                                            onChange={(e) => {
                                                handleChange("category")(e);
                                                setShowSuggestions((prev) => ({ ...prev, category: true }));
                                            }}
                                            onFocus={() => setShowSuggestions((prev) => ({ ...prev, category: true }))}
                                            placeholder="Search or type category"
                                            className="form-input-premium font-bold tracking-wide"
                                            onKeyDown={handleKeyDown}
                                        />
                                        {showSuggestions.category && metadataSuggestions.category.length > 0 && (
                                            <div className="absolute z-50 mt-1 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                                {loadingMetadata.category ? (
                                                    <div className="p-3 text-sm text-slate-500">Loading...</div>
                                                ) : metadataSuggestions.category.map((item, index) => (
                                                    <button
                                                        key={`category-suggestion-${index}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setDrugForm((prev) => ({ ...prev, category: item }));
                                                            setShowSuggestions((prev) => ({ ...prev, category: false }));
                                                        }}
                                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormField>
                                <FormField label="Dosage Form">
                                    <select value={drugForm.dosage_form} onChange={handleChange("dosage_form")} className="form-input-premium font-bold tracking-wide cursor-pointer uppercase text-xs">
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
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <FormField label="Manufacture Date">
                                    <input
                                        type="date"
                                        value={drugForm.manufacture_date || ""}
                                        onChange={handleChange("manufacture_date")}
                                        className="form-input-premium font-bold tracking-wide cursor-pointer"
                                        max={drugForm.expire_date || undefined}
                                    />
                                </FormField>
                            </div>
                        </div>

                        {mode === "edit" && batches.length > 1 && (
                            <div className="space-y-2 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30">
                                <label className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-widest">
                                    Edit which batch?
                                </label>
                                <select
                                    value={drugForm.batch_inventory_id || ""}
                                    onChange={handleChange("batch_inventory_id")}
                                    className="form-input-premium w-full font-bold text-xs"
                                >
                                    <option value="">Summary only (threshold, descriptions)</option>
                                    {batches.map((b) => (
                                        <option key={b.batch_inventory_id} value={b.batch_inventory_id}>
                                            {b.batch_number} — {b.available} units (exp {b.expiration_date})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Section 3: Pricing & Inventory */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 pb-2 border-b border-slate-50 dark:border-slate-800/30">
                                <CheckCircle size={16} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Inventory & Pricing</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField label="Selling Price">
                                    <input
                                        type="number"
                                        value={drugForm.price}
                                        onChange={handleChange("price")}
                                        placeholder="0.00"
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <FormField label="Cost Price">
                                    <input
                                        type="number"
                                        value={drugForm.cost_price}
                                        onChange={handleChange("cost_price")}
                                        placeholder="0.00"
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                {mode === "add" ? (
                                <FormField label="Batch quantity">
                                    <input
                                        type="number"
                                        value={drugForm.stock}
                                        onChange={handleChange("stock")}
                                        placeholder="0"
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                ) : (
                                <FormField label="Batch stock (use Adjust on batch list to add/remove)">
                                    <input
                                        type="number"
                                        value={drugForm.stock}
                                        onChange={handleChange("stock")}
                                        placeholder="0"
                                        className="form-input-premium font-bold tracking-wide opacity-70"
                                        onKeyDown={handleKeyDown}
                                        title="Prefer Adjust button in expanded batches for +/- stock"
                                    />
                                </FormField>
                                )}
                                <FormField label="Low Stock Alert">
                                    <input
                                        type="number"
                                        value={drugForm.low_stock_threshold}
                                        onChange={handleChange("low_stock_threshold")}
                                        placeholder="10"
                                        className="form-input-premium font-bold tracking-wide"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <FormField label="Expiry Date" error={errors.expire_date}>
                                    <input
                                        type="date"
                                        value={drugForm.expire_date}
                                        onChange={handleChange("expire_date")}
                                        className="form-input-premium font-bold tracking-wide cursor-pointer"
                                        onKeyDown={handleKeyDown}
                                        min={getExpireMin(drugForm.manufacture_date) || undefined}
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
                                            <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${drugForm.rxRequired ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-slate-300 dark:bg-slate-800 border border-slate-200/20"}`}></div>
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${drugForm.rxRequired ? "translate-x-6" : ""}`}></div>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                                            Prescription Required (Rx)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Descriptions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 pb-2 border-b border-slate-50 dark:border-slate-800/30">
                                <AlertCircle size={16} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">About Drug Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Description (EN)">
                                    <textarea
                                        value={drugForm.about_drug_en}
                                        onChange={handleChange("about_drug_en")}
                                        rows={3}
                                        className="form-input-premium resize-none font-bold tracking-wide leading-relaxed"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                                <FormField label="Description (AM)">
                                    <textarea
                                        value={drugForm.about_drug_am}
                                        onChange={handleChange("about_drug_am")}
                                        rows={3}
                                        className="form-input-premium resize-none font-bold tracking-wide leading-relaxed"
                                        onKeyDown={handleKeyDown}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/60 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="drug-inventory-form"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
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
        {error && <p className="text-[10px] font-bold text-rose-500 pl-1">{error}</p>}
    </div>
);

const PackageIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);