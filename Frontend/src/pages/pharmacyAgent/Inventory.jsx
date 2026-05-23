import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Edit2, Loader2, Plus, Search, Trash2,
    AlertTriangle, Package, Clock, Ban, CheckCircle,
    ChevronLeft, ChevronRight, Filter, Eye, EyeOff,
    TrendingDown, History, RotateCcw, X, Bell, MinusCircle,
    ChevronDown, ChevronUp, Layers
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import {
    apiGetInventory,
    apiAddDrug,
    apiDeleteDrug,
    apiUpdateDrug,
    apiGetAnalytics,
    apiToggleAvailability,
    apiDispenseFifo,
    apiAdjustBatchStock,
} from "../../api/inventory";
import DrugInventoryModal from "./DrugInventoryModal";
import InventoryHistory from "./components/InventoryHistory";
import InventoryTrash from "./components/InventoryTrash";
import BatchAlertsTab from "./components/BatchAlertsTab";
import BatchTable from "./components/BatchTable";
import DispenseModal from "./components/DispenseModal";
import BatchAdjustModal from "./components/BatchAdjustModal";
import {
    EMPTY_DRUG_FORM,
    getInv,
    getInventoryRowId,
    normalizeInventoryList,
    formatInventoryDate,
} from "../../utils/inventoryHelpers";
import { useTranslation } from "react-i18next";

export default function Inventory() {
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState("active");
    const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);

    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [inventoryError, setInventoryError] = useState(null);
    const [inventory, setInventory] = useState([]);

    // Filters & Pagination state
    const [params, setParams] = useState({
        search: "",
        category: "all",
        status: "all",
        page: 1,
        per_page: 8
    });
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDispenseModal, setShowDispenseModal] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [dispenseDrug, setDispenseDrug] = useState(null);
    const [adjustBatch, setAdjustBatch] = useState(null);
    const [adjustBatchMode, setAdjustBatchMode] = useState("add");
    const [expandedRows, setExpandedRows] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [drugForm, setDrugForm] = useState({ ...EMPTY_DRUG_FORM });

    const fetchAnalytics = async () => {
        try {
            const res = await apiGetAnalytics();
            if (res.success) setAnalytics(res.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchInventory = useCallback(async () => {
        setIsLoadingInventory(true);
        setInventoryError(null);
        try {
            const response = await apiGetInventory(params);
            const { items, meta: pageMeta } = normalizeInventoryList(response);
            setInventory(items);
            setMeta(pageMeta);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setInventoryError(t("inventory.toast.loadFailed"));
        } finally {
            setIsLoadingInventory(false);
        }
    }, [params, t]);

    useEffect(() => {
        if (subTab === "active") {
            fetchInventory();
            fetchAnalytics();
        } else {
            fetchAnalytics(); // Keep analytics fresh
        }
    }, [subTab, fetchInventory]);

    const handleAddDrug = async () => {
        setIsSubmitting(true);
        try {
            const response = await apiAddDrug(drugForm);
            if (response.success) {
                toast.success(t("inventory.toast.drugAdded"));
                fetchInventory();
                fetchAnalytics();
                setShowAddModal(false);
                resetDrugForm();
            } else {
                toast.error(response.message || t("error.failedAdd"));
            }
        } catch (error) {
            console.error("Error adding drug:", error);
            toast.error(t("inventory.toast.failedAdd"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditDrug = async () => {
        if (!selectedDrug) return;
        setIsSubmitting(true);

        try {
            const inventoryId = getInventoryRowId(selectedDrug);
            const payload = {
                ...drugForm,
                batch_inventory_id: drugForm.batch_inventory_id
                    ? Number(drugForm.batch_inventory_id)
                    : undefined,
                prescription_required: drugForm.rxRequired,
            };
            const response = await apiUpdateDrug(inventoryId, payload);
            if (response.success) {
                toast.success(t("inventory.toast.drugUpdated"));
                fetchInventory();
                fetchAnalytics();
                setShowEditModal(false);
                setSelectedDrug(null);
                resetDrugForm();
            } else {
                toast.error(response.message || t("error.failedUpdate"));
            }
        } catch (error) {
            console.error("Error updating drug:", error);
            toast.error(t("inventory.toast.failedUpdate"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleAvailability = async (drug) => {
        try {
            const res = await apiToggleAvailability(getInventoryRowId(drug));
            if (res.success) {
                toast.success(res.is_available ? t("inventory.filters.available") : t("inventory.filters.unavailable"));
                fetchInventory();
            }
        } catch (error) {
            toast.error(t("inventory.toast.failedUpdate"));
        }
    };

    const resetDrugForm = () => {
        setDrugForm({ ...EMPTY_DRUG_FORM });
    };

    const handleBatchAdjust = async ({ quantity_change, reason, low_stock_threshold }) => {
        if (!adjustBatch) return;
        setIsSubmitting(true);
        try {
            const res = await apiAdjustBatchStock(adjustBatch.batch_inventory_id, {
                quantity_change,
                reason,
                low_stock_threshold,
            });
            if (res.success) {
                toast.success(res.message || "Batch updated");
                setAdjustBatch(null);
                fetchInventory();
                fetchAnalytics();
            } else {
                toast.error(res.message || "Update failed");
            }
        } catch {
            toast.error("Failed to adjust batch stock");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispense = async ({ quantity, reason }) => {
        if (!dispenseDrug) return;
        setIsSubmitting(true);
        try {
            const res = await apiDispenseFifo({
                drug_id: dispenseDrug.id,
                quantity,
                reason: reason || "FIFO dispense",
            });
            if (res.success) {
                toast.success("Dispensed using FIFO");
                setShowDispenseModal(false);
                setDispenseDrug(null);
                fetchInventory();
                fetchAnalytics();
            } else {
                toast.error(res.message || "Insufficient stock");
            }
        } catch {
            toast.error("Dispense failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleExpandRow = (rowKey) => {
        setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
    };

    const handleDeleteDrug = async () => {
        if (!selectedDrug) return;
        setIsSubmitting(true);
        try {
            const response = await apiDeleteDrug(getInventoryRowId(selectedDrug));
            if (response.success) {
                toast.success("deleted!");
                fetchInventory();
                fetchAnalytics();
                setShowDeleteModal(false);
                setSelectedDrug(null);
            }
        } catch (error) {
            console.error("Error deleting drug:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearchChange = (e) => {
        setParams(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const openEditModal = (drug) => {
        setSelectedDrug(drug);
        const inv = getInv(drug);
        const batches = drug.batches || [];
        const batch = batches[0];
        setDrugForm({
            brand_name_en: drug.brand_name_en || "",
            brand_name_am: drug.brand_name_am || "",
            genericName: drug.generic_name || "",
            about_drug_en: inv.about_drug_en || "",
            about_drug_am: inv.about_drug_am || "",
            stock: batch?.available ?? inv.stock ?? 0,
            low_stock_threshold: inv.low_stock_threshold || 10,
            price: batch?.price ?? inv.price ?? "",
            cost_price: batch?.cost ?? inv.cost_price ?? "",
            manufacturer: batch?.manufacturer ?? inv.manufacturer ?? "",
            category: batch?.category ?? inv.category ?? "",
            dosage_form: batch?.dosage_form ?? inv.dosage_form ?? "",
            expire_date: formatInventoryDate(batch?.expiration_date || inv.expire_date),
            manufacture_date: formatInventoryDate(batch?.manufacture_date) === "—" ? "" : formatInventoryDate(batch?.manufacture_date),
            batch_number: batch?.batch_number ?? inv.batch_number ?? "",
            batch_inventory_id: batch?.batch_inventory_id ?? null,
            rxRequired: inv.prescription_required || false,
        });
        setShowEditModal(true);
    };

    const getCategoryBadgeStyles = (category) => {
        const cat = String(category).toLowerCase();
        if (cat.includes("antibiotic")) return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30";
        if (cat.includes("pain") || cat.includes("relief")) return "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-900/30";
        if (cat.includes("cardio") || cat.includes("heart")) return "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30";
        if (cat.includes("vitamin") || cat.includes("supplement")) return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30";
        return "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30";
    };

    const rowContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04
            }
        }
    };

    const rowItemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    const renderMainInventory = () => (
        <div className="space-y-6">
            {/* Analytics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <AnalyticsCard
                    title={t("inventory.analytics.totalItems")}
                    value={analytics?.total_items || 0}
                    icon={<Package className="text-emerald-500" />}
                    bgColor="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100/20"
                    description={t("inventory.analytics.totalItemDesc")}
                    active={selectedAnalyticsType === "drugs"}
                    onClick={() => setSelectedAnalyticsType(selectedAnalyticsType === "drugs" ? null : "drugs")}
                />
                <AnalyticsCard
                    title={t("inventory.analytics.lowStock")}
                    value={analytics?.low_stock || 0}
                    icon={<AlertTriangle className="text-amber-500" />}
                    bgColor="bg-amber-50 dark:bg-amber-950/40 border-amber-100/20"
                    description={t("inventory.analytics.lowStockDesc")}
                    active={selectedAnalyticsType === "low_stock_items"}
                    onClick={() => setSelectedAnalyticsType(selectedAnalyticsType === "low_stock_items" ? null : "low_stock_items")}
                />
                <AnalyticsCard
                    title={t("inventory.analytics.outOfStock")}
                    value={analytics?.out_of_stock || 0}
                    icon={<Ban className="text-rose-500" />}
                    bgColor="bg-rose-50 dark:bg-rose-950/40 border-rose-100/20"
                    description={t("inventory.analytics.outofStockDesc")}
                    active={selectedAnalyticsType === "out_of_stock_items"}
                    onClick={() => setSelectedAnalyticsType(selectedAnalyticsType === "out_of_stock_items" ? null : "out_of_stock_items")}
                />
                <AnalyticsCard
                    title={t("inventory.analytics.expiringSoon")}
                    value={analytics?.expiring_soon || 0}
                    icon={<Clock className="text-purple-500" />}
                    bgColor="bg-purple-50 dark:bg-purple-950/40 border-purple-100/20"
                    description={t("inventory.analytics.expiringSoonDesc")}
                    active={selectedAnalyticsType === "expiring_soon_items"}
                    onClick={() => setSelectedAnalyticsType(selectedAnalyticsType === "expiring_soon_items" ? null : "expiring_soon_items")}
                />
            </div>

            {/* Expanded Analytics Details */}
            <AnimatePresence>
                {selectedAnalyticsType && analytics?.[selectedAnalyticsType] && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner"
                    >
                        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                                <Package size={18} className="text-emerald-500" />
                                <h3 className="font-black text-sm uppercase tracking-wider">
                                    {selectedAnalyticsType.replace(/_/g, ' ')}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedAnalyticsType(null)} 
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                                <X size={16}/>
                            </button>
                        </div>
                        <div className="p-4 max-h-[300px] overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {analytics[selectedAnalyticsType].length > 0 ? (
                                analytics[selectedAnalyticsType].map(item => (
                                    <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-start gap-3 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                                            <Package size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                                                {item.drug?.brand_name_en || item.brand_name_en || item.generic_name}
                                                {item.batch_number && (
                                                    <span className="text-slate-400 font-semibold"> · {item.batch_number}</span>
                                                )}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                                    (item.stock ?? item.available) === 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' : 
                                                    (item.stock ?? item.available) <= (item.low_stock_threshold || 10) ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' : 
                                                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                                                }`}>
                                                    Stock: {item.stock ?? item.available ?? 0}
                                                </span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                    Exp: {(item.expire_date || item.expiration_date || '').toString().split('T')[0] || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    No items found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t("inventory.searchPlaceholder")}
                            value={params.search}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-sm tracking-wide dark:text-gray-200"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <FilterSelect
                            value={params.category}
                            onChange={(val) => handleFilterChange("category", val)}
                            options={[
                                { label: t("inventory.filters.allCategories"), value: "all" },
                                { label: "Antibiotics", value: "Antibiotics" },
                                { label: "Pain Relief", value: "Pain Relief" },
                                { label: "Cardiovascular", value: "Cardiovascular" },
                                { label: "Vitamins", value: "Vitamins" }
                            ]}
                        />
                        <FilterSelect
                            value={params.status}
                            onChange={(val) => handleFilterChange("status", val)}
                            options={[
                                { label: t("inventory.filters.allStatus"), value: "all" },
                                { label: t("inventory.filters.available"), value: "available" },
                                { label: t("inventory.filters.lowStock"), value: "low_stock" },
                                { label: t("inventory.filters.outOfStock"), value: "out_of_stock" },
                                { label: t("inventory.filters.expiring"), value: "expiring" },
                                { label: "Expiring ≤ 3 months", value: "expiring_3m" },
                                { label: "Expiring ≤ 6 months", value: "expiring_6m" },
                            ]}
                        />
                        <button
                            onClick={() => {
                                resetDrugForm();
                                setShowAddModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer"
                        >
                            <Plus size={16} />
                            {t("inventory.addDrug")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden shadow-sm shadow-slate-100/50 dark:shadow-none">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-850/20 border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <th className="px-6 py-4">{t("inventory.table.drugName")}</th>
                                <th className="px-6 py-4">{t("inventory.table.category")}</th>
                                <th className="px-6 py-4">{t("inventory.table.stock")}</th>
                                <th className="px-6 py-4">{t("inventory.table.price")}</th>
                                <th className="px-6 py-4">{t("inventory.table.availability")}</th>
                                <th className="px-6 py-4">{t("inventory.table.status")}</th>
                                <th className="px-6 py-4 text-center">{t("inventory.table.actions")}</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={rowContainerVariants}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-slate-100 dark:divide-slate-800/40"
                        >
                            {isLoadingInventory ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
                                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold tracking-wide animate-pulse">{t("Common.Loading")}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold text-xs tracking-wider uppercase">
                                        {t("inventory.noDrugsFound")}
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((drug) => {
                                    const inv = getInv(drug);
                                    const batches = drug.batches || [];
                                    const rowKey = getInventoryRowId(drug);
                                    const isExpanded = expandedRows[rowKey];
                                    const isLow = inv.stock <= (inv.low_stock_threshold || 10);
                                    const isOut = inv.stock === 0;

                                    return (
                                        <React.Fragment key={rowKey}>
                                        <motion.tr
                                            variants={rowItemVariants}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors group"
                                        >
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-800 dark:to-slate-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100/20 dark:border-slate-800/30 group-hover:scale-105 transition-transform duration-300">
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                                            {drug.brand_name_en}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic mt-0.5">
                                                            {drug.generic_name}
                                                        </p>
                                                        {batches.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandRow(rowKey)}
                                                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-flex items-center gap-0.5 hover:underline"
                                                            >
                                                                <Layers size={10} />
                                                                {batches.length} batch{batches.length > 1 ? "es" : ""}
                                                                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black w-fit uppercase tracking-wider ${getCategoryBadgeStyles(inv.category)}`}>
                                                        {inv.category || "—"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1 pl-1">
                                                        {inv.dosage_form}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-sm tracking-wide ${isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-emerald-500"}`}>
                                                        {inv.stock} {t("inventory.toast.units")}
                                                    </span>
                                                    {isLow && !isOut && (
                                                        <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold mt-0.5">
                                                            <TrendingDown size={10} />
                                                            {t("inventory.filters.lowStock")}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-700 dark:text-slate-200">
                                                        {inv.price} {t("Common.Currency")}
                                                    </span>
                                                    {inv.cost_price && (
                                                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                            {t("inventory.table.costPrice")}: {inv.cost_price}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                        <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                                                        {(inv.expire_date || "").toString().split("T")[0] || "—"}
                                                    </div>
                                                    {batches.length > 1 && (
                                                        <span className="text-[10px] text-purple-500 font-bold">
                                                            +{batches.length - 1} more expiry date{batches.length > 2 ? "s" : ""}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <StatusBadge inv={inv} t={t} />
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {inv.stock > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDispenseDrug({ ...drug, total_stock: inv.stock });
                                                                setShowDispenseModal(true);
                                                            }}
                                                            className="p-2 text-violet-500 bg-violet-50 dark:bg-violet-950/40 rounded-xl hover:bg-violet-500 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer"
                                                            title="FIFO dispense"
                                                        >
                                                            <MinusCircle size={16} />
                                                        </button>
                                                    )}
                                                    {batches.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setAdjustBatch(batches[0]);
                                                                setAdjustBatchMode("add");
                                                            }}
                                                            className="p-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer"
                                                            title="Add stock"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleAvailability(drug)}
                                                        className={`p-2 rounded-xl transition-all duration-300 active:scale-90 cursor-pointer ${inv.is_available
                                                                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-500 hover:text-white"
                                                                : "text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-500 hover:text-white"
                                                            }`}
                                                        title={inv.is_available ? "Disable" : "Enable"}
                                                    >
                                                        {inv.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(drug)}
                                                        className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDrug(drug);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                        {isExpanded && batches.length > 0 && (
                                            <tr className="bg-slate-50/80 dark:bg-slate-850/20">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <BatchTable
                                                        batches={batches}
                                                        onAdjustStock={(b, mode) => {
                                                            setAdjustBatch(b);
                                                            setAdjustBatchMode(mode || "add");
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </motion.tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        {t("search.resultCount", { count: meta.total })}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={params.page === 1}
                            onClick={() => handleFilterChange("page", params.page - 1)}
                            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 disabled:opacity-30 transition-all font-bold shadow-sm active:scale-90 cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase w-28 text-center select-none">
                            {params.page} / {meta.last_page}
                        </span>
                        <button
                            disabled={params.page === meta.last_page}
                            onClick={() => handleFilterChange("page", params.page + 1)}
                            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 disabled:opacity-30 transition-all font-bold shadow-sm active:scale-90 cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            key="inventory-container"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {/* Header with Sub-Tabs - Slider Design */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5 relative">
                    <TabButton
                        active={subTab === "active"}
                        onClick={() => setSubTab("active")}
                        icon={<Package size={16} />}
                        label={t("inventory.tabs.active")}
                    />
                    <TabButton
                        active={subTab === "history"}
                        onClick={() => setSubTab("history")}
                        icon={<History size={16} />}
                        label={t("inventory.tabs.history")}
                    />
                    <TabButton
                        active={subTab === "trash"}
                        onClick={() => setSubTab("trash")}
                        icon={<Trash2 size={16} />}
                        label={t("inventory.tabs.trash")}
                    />
                    <TabButton
                        active={subTab === "alerts"}
                        onClick={() => setSubTab("alerts")}
                        icon={<Bell size={16} />}
                        label="Alerts"
                    />
                </div>
            </div>

            {/* Dynamic Content Rendering */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={subTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {subTab === "active" && renderMainInventory()}
                    {subTab === "history" && <InventoryHistory />}
                    {subTab === "trash" && <InventoryTrash />}
                    {subTab === "alerts" && <BatchAlertsTab />}
                </motion.div>
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <DrugInventoryModal
                        mode="add"
                        title={t("modal.drugInventory.titleAdd")}
                        drugForm={drugForm}
                        setDrugForm={setDrugForm}
                        onSubmit={handleAddDrug}
                        onClose={() => setShowAddModal(false)}
                        isSubmitting={isSubmitting}
                        submitLabel={t("modal.drugInventory.actions.submitAdd")}
                    />
                )}
                {showEditModal && (
                    <DrugInventoryModal
                        mode="edit"
                        batches={selectedDrug?.batches || []}
                        title={t("modal.drugInventory.titleEdit")}
                        drugForm={drugForm}
                        setDrugForm={setDrugForm}
                        onSubmit={handleEditDrug}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedDrug(null);
                        }}
                        isSubmitting={isSubmitting}
                        submitLabel={t("modal.drugInventory.actions.submitEdit")}
                    />
                )}
                {showDispenseModal && dispenseDrug && (
                    <DispenseModal
                        drug={dispenseDrug}
                        onClose={() => {
                            setShowDispenseModal(false);
                            setDispenseDrug(null);
                        }}
                        onSubmit={handleDispense}
                        isSubmitting={isSubmitting}
                    />
                )}
                {adjustBatch && (
                    <BatchAdjustModal
                        batch={adjustBatch}
                        initialMode={adjustBatchMode}
                        onClose={() => {
                            setAdjustBatch(null);
                            setAdjustBatchMode("add");
                        }}
                        onSubmit={handleBatchAdjust}
                        isSubmitting={isSubmitting}
                    />
                )}
                {showDeleteModal && selectedDrug && (
                    <DeleteConfirmModal
                        drugName={selectedDrug.brand_name_en || selectedDrug.generic_name}
                        onConfirm={handleDeleteDrug}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setSelectedDrug(null);
                        }}
                        isSubmitting={isSubmitting}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="relative flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
    >
        {active && (
            <motion.span
                layoutId="activeSubTab"
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 shadow-md shadow-emerald-500/15 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
        )}
        <span className={`relative z-10 flex items-center gap-2 ${active ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"}`}>
            {icon}
            <span>{label}</span>
        </span>
    </button>
);

const AnalyticsCard = ({ title, value, icon, bgColor, description, active, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={onClick}
            className={`relative p-5 rounded-3xl border ${active ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/50 dark:border-slate-800/80'} bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/2 transition-all duration-300 group overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* FRONT */}
            <div className="flex items-center justify-between transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {title}
                    </p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white transition-transform origin-left group-hover:scale-105 leading-none mt-2">
                        {value}
                    </p>
                </div>

                <div className={`w-14 h-14 ${bgColor} border rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

const FilterSelect = ({ value, onChange, options }) => (
    <div className="relative group">
        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs font-black uppercase tracking-wider min-w-[160px] cursor-pointer appearance-none transition-all dark:text-gray-200"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const StatusBadge = ({ inv, t }) => {
    const isAvailable = inv.is_available && inv.stock > 0;
    const isOut = inv.stock === 0;
    const isLow = inv.stock <= (inv.low_stock_threshold || 10);

    if (!inv.is_available) {
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-slate-100 text-slate-450 dark:bg-slate-800 border border-slate-200/60 select-none uppercase tracking-wider">Disabled</span>;
    }

    if (isOut) {
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-100/50 select-none uppercase tracking-wider">{t("inventory.filters.outOfStock")}</span>;
    }

    if (isLow) {
        return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-100/50 select-none uppercase tracking-wider">{t("inventory.filters.lowStock")}</span>;
    }

    return <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-100/50 select-none uppercase tracking-wider">{t("inventory.filters.available")}</span>;
};

const DeleteConfirmModal = ({ drugName, onConfirm, onClose, isSubmitting }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-250/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-500 border border-rose-100/50">
                        <Trash2 size={40} className="text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{t("modal.delete.title")}</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic text-xs">
                            {t("modal.delete.confirmMessage", { name: drugName })}
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-650 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                        >
                            {t("modal.delete.cancel")}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            {t("modal.delete.delete")}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};