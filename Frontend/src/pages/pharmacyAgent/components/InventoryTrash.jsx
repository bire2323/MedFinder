import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiGetTrash, apiRestoreDrug } from "../../../api/inventory";
import { Trash2, RotateCcw, Package, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Loading from "../../../component/SupportiveComponent/Loading";

const InventoryTrash = () => {
  const { t } = useTranslation();
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await apiGetTrash();
      if (res.success) {
        setTrashedItems(res.data);
      }
    } catch (error) {
      toast.error(t("inventory.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id, name) => {
    try {
      setRestoringId(id);
      const res = await apiRestoreDrug(id);
      if (res.success) {
        toast.success(t("inventory.toast.drugRestored"));
        setTrashedItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      toast.error(t("inventory.error.failedUpdate"));
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Loading/>
       
    </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t("inventory.trash.title")}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("inventory.trash.description")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {trashedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t("inventory.trash.empty")}</h3>
            <p className="text-gray-500 max-w-xs mt-2">
              Medicines you delete from the inventory will appear here for 30 days before being permanently removed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    {t("inventory.table.drugName")}
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    {t("inventory.table.category")}
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    {t("inventory.table.stock")}
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Deleted At
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">
                    {t("inventory.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {trashedItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-1">
                              {item.drug?.brand_name_en}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {item.drug?.generic_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                          {item.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {item.stock} {t("inventory.toast.units")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRestore(item.id, item.drug?.brand_name_en)}
                          disabled={restoringId === item.id}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50"
                        >
                          {restoringId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          {t("inventory.trash.restore")}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTrash;
