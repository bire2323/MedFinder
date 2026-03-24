import React from "react";
import { motion } from "framer-motion";
import { Search, Plus, Loader2, Edit2, Trash2 } from "lucide-react";

export default function DepartmentsTab({
  searchDeptQuery,
  setSearchDeptQuery,
  resetDeptForm,
  setShowAddDeptModal,
  isLoadingDepts,
  filteredDepartments,
  openEditDeptModal,
  setSelectedDept,
  setShowDeleteDeptModal
}) {
  return (
    <motion.div
      key="departments"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchDeptQuery}
            onChange={(e) => setSearchDeptQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button
          onClick={() => {
            resetDeptForm();
            setShowAddDeptModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {isLoadingDepts ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-gray-900/50">
                <tr className="text-[11px] uppercase text-slate-400 border-b dark:border-gray-700">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Head Doctor</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700 text-sm">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">#{dept.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{dept.name}</p>
                        <p className="text-[10px] text-slate-400">{dept.description}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-400">{dept.headDoctor || "N/A"}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{dept.floor || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${dept.isActive
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                            : "bg-slate-100 text-slate-500 dark:bg-gray-700"
                            }`}
                        >
                          {dept.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditDeptModal(dept)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDept(dept);
                              setShowDeleteDeptModal(true);
                            }}
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
        </div>
      )}
    </motion.div>
  );
}
