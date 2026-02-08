import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Edit2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
    apiGetInventory,
    apiAddDrug,
    apiDeleteDrug,
    apiSearchDrugs,
    apiGetDrug,
    apiUpdateDrug,
} from "../../api/inventory";
import DrugInventoryModal from "./DrugInventoryModal";

export default function Inventory({ activeTab, setActiveTab }) {

    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [inventoryError, setInventoryError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inventory, setInventory] = useState([]);


    // --- Modal States ---
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [drugName, setDrugName] = useState(null);

    // --- Form State for Add/Edit ---
    const [drugForm, setDrugForm] = useState({
        brand_name_en: "",
        brand_name_am: "",
        genericName: "",
        about_drug_en: "",
        about_drug_am: "",
        stock: "",
        price: "",
        expiryDate: "",
        rxRequired: false,
    });
    const fetchInventory = async () => {
        setIsLoadingInventory(true);
        setInventoryError(null);
        try {
            const response = await apiGetInventory();
            if (response.success && response.data) {

                setInventory(response.data);
            } else {

            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setInventoryError("Failed to load inventory");
        } finally {
            setIsLoadingInventory(false);
        }
    };
    // --- Fetch Inventory ---
    useEffect(() => {
        if (activeTab === "inventory") {
            fetchInventory();
        }
    }, [activeTab]);
    // --- Add Drug Handler ---
    const handleAddDrug = async () => {
        setIsSubmitting(true);
        try {

            const response = await apiAddDrug(drugForm);
            if (response.success) {
                alert('drug added to the inventory');
                fetchInventory();
                setShowAddModal(false);
                resetDrugForm();
            } else {
                alert(response.message || "Failed to add drug");
            }
        } catch (error) {
            console.error("Error adding drug:", error);
            alert("Failed to add drug. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Edit Drug Handler ---
    const handleEditDrug = async () => {
        if (!selectedDrug) return;
        setIsSubmitting(true);
        try {
            const response = await apiUpdateDrug(selectedDrug.id, drugForm);
            if (response.success) {
                // console.log(response.data);
                fetchInventory();
                setShowEditModal(false);
                setSelectedDrug(null);
                setDrugName(null);
                resetDrugForm();
            } else {
                alert(response.message || "Failed to update drug");
            }
        } catch (error) {
            console.error("Error updating drug:", error);
            alert("Failed to update drug. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Reset Form ---
    const resetDrugForm = () => {
        setDrugForm({
            brand_name_en: "",
            brand_name_am: "",
            genericName: "",
            about_drug_en: "",
            about_drug_am: "",
            stock: "",
            price: "",
            expiryDate: "",
            rxRequired: false,
        });
    };
    // --- Delete Drug Handler ---
    const handleDeleteDrug = async () => {
        if (!selectedDrug) return;
        setIsSubmitting(true);
        try {
            const response = await apiDeleteDrug(selectedDrug.id);
            if (response.success) {
                // Remove from local state
                setInventory(inventory.filter((d) => d.id !== selectedDrug.id));
                setShowDeleteModal(false);
                setSelectedDrug(null);
            } else {
                alert(response.message || "Failed to delete drug");
            }
        } catch (error) {
            console.error("Error deleting drug:", error);
            // For demo, remove from local state anyway
            setInventory(inventory.filter((d) => d.id !== selectedDrug.id));
            setShowDeleteModal(false);
            setSelectedDrug(null);
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- Search Handler ---
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            try {
                const response = await apiSearchDrugs(query);
                if (response.success && response.data) {
                    setInventory(response.data);
                }
            } catch (error) {
                console.error("Search error:", error);
            }
        } else if (query.length === 0) {
            fetchInventory();
        }
    };

    // Filter inventory based on search
    const filteredInventory = inventory.filter(
        (drug) =>
            drug.about_drug_en?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // --- Open Edit Modal ---
    const openEditModal = (drug) => {
        setSelectedDrug(drug);
        apiGetDrug(drug.id).then((res) => {
            if (res.success) {
                setDrugName(res.data);
            }
        })
        setDrugForm({
            brand_name_en: drugName.brand_name_en,
            brand_name_am: drugName.brand_name_am,
            genericName: drugName.generic_name,
            about_drug_en: drug.about_drug_en || "",
            about_drug_am: drug.about_drug_am || "",
            stock: drug.stock,
            price: drug.price || "",
            expiryDate: drug.expiryDate || "",
            rxRequired: drug.rxRequired,
        });
        setShowEditModal(true);
    };

    // --- Open Delete Modal ---
    const openDeleteModal = (drug) => {
        setSelectedDrug(drug);
        setShowDeleteModal(true);
    };

    return (
        <>
            <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
            >
                {/* Search and Add */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative w-full min-w-0 sm:w-72">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search drugs..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetDrugForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                        <Plus size={18} />
                        Add Drug
                    </button>
                </div>

                {/* Inventory Table */}
                {isLoadingInventory ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-emerald-500" />
                    </div>
                ) : inventoryError ? (
                    <div className="text-center py-20 text-red-500">{inventoryError}</div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            <table className="w-full text-left min-w-[480px]">
                                <thead className="bg-slate-50 dark:bg-gray-900/50">
                                    <tr className="text-[10px] sm:text-[11px] uppercase text-slate-400 border-b border-gray-400 dark:border-gray-500">
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">ID</th>
                                        <th className="px-6 py-4">Drug Name</th>
                                        <th className="px-6 py-4">Generic Name</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Booked Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700 text-sm">
                                    {filteredInventory.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                                No drugs found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInventory.map((drug) => (
                                            <tr
                                                key={drug.id}
                                                className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    #{drug.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold">{drug.brand_name_en}</p>

                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-gray-400">
                                                    {drug.genericName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`font-bold ${drug.stock === 0
                                                            ? "text-red-500"
                                                            : drug.stock < 20
                                                                ? "text-orange-500"
                                                                : "text-emerald-500"
                                                            }`}
                                                    >
                                                        {drug.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {drug.created_at || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-lg text-xs font-bold ${drug.stock === 0
                                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                                                            : drug.stock < 20
                                                                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                                                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                                            }`}
                                                    >
                                                        {drug.stock === 0
                                                            ? "Out of Stock"
                                                            : drug.stock < 20
                                                                ? "Low Stock"
                                                                : "In Stock"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(drug)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(drug)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ADD DRUG MODAL */}
                        <AnimatePresence>
                            {showAddModal && (
                                <DrugInventoryModal
                                    title="Add New Drug"
                                    drugForm={drugForm}
                                    setDrugForm={setDrugForm}
                                    onSubmit={handleAddDrug}
                                    onClose={() => setShowAddModal(false)}
                                    isSubmitting={isSubmitting}
                                    submitLabel="Add Drug"
                                />
                            )}
                        </AnimatePresence>

                        {/* EDIT DRUG MODAL */}
                        <AnimatePresence>
                            {showEditModal && (
                                <DrugInventoryModal
                                    title="Edit Drug"
                                    drugForm={drugForm}
                                    setDrugForm={setDrugForm}
                                    onSubmit={handleEditDrug}
                                    onClose={() => {
                                        setShowEditModal(false);
                                        setSelectedDrug(null);
                                        setDrugName(null);

                                    }}
                                    isSubmitting={isSubmitting}
                                    submitLabel="Update Drug"
                                />
                            )}
                        </AnimatePresence>

                        {/* DELETE CONFIRMATION MODAL */}
                        <AnimatePresence>
                            {showDeleteModal && selectedDrug && (
                                <DeleteConfirmModal
                                    drugName={selectedDrug.name}
                                    onConfirm={handleDeleteDrug}
                                    onClose={() => {
                                        setShowDeleteModal(false);
                                        setSelectedDrug(null);
                                    }}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </>
    )
}
// --- Delete Confirmation Modal ---
const DeleteConfirmModal = ({ drugName, onConfirm, onClose, isSubmitting }) => (
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
            className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-400 dark:border-gray-500"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete Drug</h3>
                <p className="text-slate-500 dark:text-gray-400 mb-6">
                    Are you sure you want to delete <strong>{drugName}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={18} />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
);