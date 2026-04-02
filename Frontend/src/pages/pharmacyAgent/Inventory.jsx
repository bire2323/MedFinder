import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Edit2, Loader2, Plus, Search, Trash2,
    AlertTriangle, Package, Clock, Ban, CheckCircle,
    ChevronLeft, ChevronRight, Filter, MoreVertical,
    Eye, EyeOff, TrendingDown, DollarSign, History, RotateCcw
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import {
    apiGetInventory,
    apiAddDrug,
    apiDeleteDrug,
    apiSearchDrugs,
    apiGetDrug,
    apiUpdateDrug,
    apiGetAnalytics,
    apiToggleAvailability
} from "../../api/inventory";
import DrugInventoryModal from "./DrugInventoryModal";
import InventoryHistory from "./components/InventoryHistory";
import InventoryTrash from "./components/InventoryTrash";
import { useTranslation } from "react-i18next";
import Loading from "../../component/SupportiveComponent/Loading";

export default function Inventory({ activeTab, setActiveTab }) {
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState("active");

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
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [drugForm, setDrugForm] = useState({
        brand_name_en: "",
        brand_name_am: "",
        genericName: "",
        about_drug_en: "",
        about_drug_am: "",
        stock: "",
        low_stock_threshold: 10,
        price: "",
        cost_price: "",
        manufacturer: "",
        category: "",
        dosage_form: "",
        expire_date: "",
        batch_number: "",
        rxRequired: false,
    });

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
            if (response.success) {
                setInventory(response.data || []);
                setMeta(response.meta || { current_page: 1, last_page: 1, total: 0 });
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setInventoryError(t("inventory.toast.loadFailed"));
        } finally {
            setIsLoadingInventory(false);
        }
    }, [params, t]);

    useEffect(() => {
        if (activeTab === "inventory" && subTab === "active") {
            fetchInventory();
            fetchAnalytics();
        } else if (activeTab === "inventory") {
            fetchAnalytics(); // Keep analytics fresh
        }
    }, [activeTab, subTab, fetchInventory]);

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
            const response = await apiUpdateDrug(selectedDrug.pivot?.id || selectedDrug.inventory?.id, drugForm);
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
            const res = await apiToggleAvailability(drug.pivot?.id || drug.inventory?.id);
            if (res.success) {
                toast.success(res.is_available ? t("inventory.filters.available") : t("inventory.filters.unavailable"));
                fetchInventory();
            }
        } catch (error) {
            toast.error(t("inventory.toast.failedUpdate"));
        }
    };

    const resetDrugForm = () => {
        setDrugForm({
            brand_name_en: "",
            brand_name_am: "",
            genericName: "",
            about_drug_en: "",
            about_drug_am: "",
            stock: "",
            low_stock_threshold: 10,
            price: "",
            cost_price: "",
            manufacturer: "",
            category: "",
            dosage_form: "",
            expire_date: "",
            batch_number: "",
            rxRequired: false,
        });
    };

    const handleDeleteDrug = async () => {
        if (!selectedDrug) return;
        setIsSubmitting(true);
        try {
            const response = await apiDeleteDrug(selectedDrug.pivot?.id || selectedDrug.inventory?.id);
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
        const inv = drug.pivot || drug.inventory || {};
        setDrugForm({
            brand_name_en: drug.brand_name_en || "",
            brand_name_am: drug.brand_name_am || "",
            genericName: drug.generic_name || "",
            about_drug_en: inv.about_drug_en || "",
            about_drug_am: inv.about_drug_am || "",
            stock: inv.stock || 0,
            low_stock_threshold: inv.low_stock_threshold || 10,
            price: inv.price || "",
            cost_price: inv.cost_price || "",
            manufacturer: inv.manufacturer || "",
            category: inv.category || "",
            dosage_form: inv.dosage_form || "",
            expire_date: inv.expire_date || "",
            batch_number: inv.batch_number || "",
            rxRequired: inv.prescription_required || false,
        });
        setShowEditModal(true);
    };

    const renderMainInventory = () => (
        <div className="space-y-6">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard
                    title={t("inventory.analytics.totalItems")}
                    value={analytics?.total_items || 0}
                    icon={<Package className="text-blue-500" />}
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                    description={t("inventory.analytics.totalItemDesc")}

                />
                <AnalyticsCard
                    title={t("inventory.analytics.lowStock")}
                    value={analytics?.low_stock || 0}
                    icon={<AlertTriangle className="text-orange-500" />}
                    bgColor="bg-orange-50 dark:bg-orange-900/20"
                    description={t("inventory.analytics.lowStockDesc")}

                />
                <AnalyticsCard
                    title={t("inventory.analytics.outOfStock")}
                    value={analytics?.out_of_stock || 0}
                    icon={<Ban className="text-red-500" />}
                    bgColor="bg-red-50 dark:bg-red-900/20"
                    description={t("inventory.analytics.outofStockDesc")}
                />
                <AnalyticsCard
                    title={t("inventory.analytics.expiringSoon")}
                    value={analytics?.expiring_soon || 0}
                    icon={<Clock className="text-purple-500" />}
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                    description={t("inventory.analytics.expiringSoonDesc")}
                />
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t("inventory.searchPlaceholder")}
                            value={params.search}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
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
                                { label: t("inventory.filters.expiring"), value: "expiring" }
                            ]}
                        />
                        <button
                            onClick={() => {
                                resetDrugForm();
                                setShowAddModal(true);
                            }}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                        >
                            <Plus size={18} />
                            {t("inventory.addDrug")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-slate-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">{t("inventory.table.drugName")}</th>
                                <th className="px-6 py-4">{t("inventory.table.category")}</th>
                                <th className="px-6 py-4">{t("inventory.table.stock")}</th>
                                <th className="px-6 py-4">{t("inventory.table.price")}</th>
                                <th className="px-6 py-4">{t("inventory.table.availability")}</th>
                                <th className="px-6 py-4">{t("inventory.table.status")}</th>
                                <th className="px-6 py-4 text-center">{t("inventory.table.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoadingInventory ? (
                                <tr>
                                   <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                                          <div className="flex flex-col justify-center items-center gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce px-1.5"></span>
                                                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 animate-pulse">{t("Common.Loading")}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                                        {t("inventory.noDrugsFound")}
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((drug) => {
                                    const inv = drug.pivot || drug.inventory || {};
                                    const isLow = inv.stock <= (inv.low_stock_threshold || 10);
                                    const isOut = inv.stock === 0;

                                    return (
                                        <tr key={drug.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                                            {drug.brand_name_en}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[150px]">
                                                            {drug.generic_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="text-slate-600 dark:text-gray-400 font-medium">{inv.category || "—"}</span>
                                                <p className="text-[10px] text-slate-400">{inv.dosage_form}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-emerald-500"}`}>
                                                        {inv.stock} {t("inventory.toast.units")}
                                                    </span>
                                                    {isLow && !isOut && (
                                                        <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                                                            <TrendingDown size={10} />
                                                            {t("inventory.filters.lowStock")}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-bold text-slate-700 dark:text-gray-200">
                                                        {inv.price} {t("Common.Currency")}
                                                    </span>
                                                    {inv.cost_price && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {t("inventory.table.costPrice")}: {inv.cost_price}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {inv.expire_date || "—"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge inv={inv} t={t} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleAvailability(drug)}
                                                        className={`p-2 rounded-lg transition-colors ${inv.is_available ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                                                        title={inv.is_available ? "Disable" : "Enable"}
                                                    >
                                                        {inv.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(drug)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDrug(drug);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-bold">
                        {t("search.resultCount", { count: meta.total })}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={params.page === 1}
                            onClick={() => handleFilterChange("page", params.page - 1)}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all font-bold shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs font-bold w-32 text-center uppercase tracking-widest text-slate-400">
                            Page {params.page} / {meta.last_page}
                        </span>
                        <button
                            disabled={params.page === meta.last_page}
                            onClick={() => handleFilterChange("page", params.page + 1)}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all font-bold shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            key="inventory-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {/* Header with Sub-Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-1">
                    <TabButton
                        active={subTab === "active"}
                        onClick={() => setSubTab("active")}
                        icon={<Package size={18} />}
                        label={t("inventory.tabs.active")}
                    />
                    <TabButton
                        active={subTab === "history"}
                        onClick={() => setSubTab("history")}
                        icon={<History size={18} />}
                        label={t("inventory.tabs.history")}
                    />
                    <TabButton
                        active={subTab === "trash"}
                        onClick={() => setSubTab("trash")}
                        icon={<Trash2 size={18} />}
                        label={t("inventory.tabs.trash")}
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
                </motion.div>
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <DrugInventoryModal
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
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 ${active
            ? "bg-primary text-white shadow-lg shadow-primary/25"
            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-700/50"
            }`}
    >
        {icon}
        <span className="text-sm">{label}</span>
    </button>
);


const AnalyticsCard = ({ title, value, icon, bgColor, description }) => {
    return (
        <div className="relative p-5 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* FRONT (default) */}
            <div className="flex items-center justify-between transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {title}
                    </p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white transition-transform origin-left group-hover:scale-105">
                        {value}
                    </p>
                </div>

                <div
                    className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12`}
                >
                    {React.cloneElement(icon, { size: 28 })}
                </div>
            </div>

            {/* BACK (hover content) */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {description}
                </p>
            </div>
        </div>
    );
};


const FilterSelect = ({ value, onChange, options }) => (
    <div className="relative group">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold min-w-[160px] cursor-pointer appearance-none transition-all"
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
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-400 dark:bg-gray-700 select-none uppercase tracking-wider border border-slate-200">Disabled</span>;
    }

    if (isOut) {
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 dark:bg-red-900/20 select-none uppercase tracking-wider border border-red-100">{t("inventory.filters.outOfStock")}</span>;
    }

    if (isLow) {
        return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 dark:bg-orange-900/20 select-none uppercase tracking-wider border border-orange-100">{t("inventory.filters.lowStock")}</span>;
    }

    return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 select-none uppercase tracking-wider border border-emerald-100">{t("inventory.filters.available")}</span>;
};

const DeleteConfirmModal = ({ drugName, onConfirm, onClose, isSubmitting }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-10 text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-500">
                        <Trash2 size={48} className="text-red-500" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{t("modal.delete.title")}</h3>
                        <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-semibold italic">
                            {t("modal.delete.confirmMessage", { name: drugName })}
                        </p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 dark:bg-gray-700 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                        >
                            {t("modal.delete.cancel")}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={20} />}
                            {t("modal.delete.delete")}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

};