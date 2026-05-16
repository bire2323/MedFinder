import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Loader2, Edit2, Trash2, Building2, MoreVertical } from "lucide-react";

import { useOutletContext } from "react-router-dom";

export default function DepartmentsTab() {
  const {
    searchDeptQuery,
    setSearchDeptQuery,
    resetDeptForm,
    setShowAddDeptModal,
    isLoading,
    departments,
    openEditDeptModal,
    setSelectedDept,
    setShowDeleteDeptModal
  } = useOutletContext();

  const filteredDepartments = departments.filter(d =>
    d.department_name_en?.toLowerCase().includes(searchDeptQuery.toLowerCase()) ||
    d.department_name_am?.includes(searchDeptQuery)
  );
  return (
    <motion.div
      key="departments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchDeptQuery}
            onChange={(e) => setSearchDeptQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-700 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            resetDeptForm();
            setShowAddDeptModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 shrink-0"
        >
          <Plus size={20} />
          Add Department
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="text-slate-400 font-bold animate-pulse">Loading departments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDepartments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white dark:bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-gray-700 shadow-inner"
              >
                <div className="w-20 h-20 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Building2 size={40} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-black text-xl">No departments found</p>
                <p className="text-slate-400 text-sm font-bold">Try adjusting your search query</p>
              </motion.div>
            ) : (
              filteredDepartments.map((dept, index) => (
                <motion.div
                  key={dept.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Building2 size={28} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDeptModal(dept)}
                        className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDept(dept);
                          setShowDeleteDeptModal(true);
                        }}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white line-clamp-1">
                        {dept.department_name_en}
                      </h4>
                      <p className="text-sm font-bold text-slate-400 italic">
                        {dept.department_name_am}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       <span className="px-4 py-1.5 bg-slate-50 dark:bg-gray-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-full border border-slate-100 dark:border-gray-700">
                        {dept.department_category_name_en || "General"}
                      </span>
                      <span className="px-4 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 uppercase tracking-widest rounded-full border border-blue-50 dark:border-blue-900/50">
                        {dept.department_category_name_am || "ጠቅላላ"}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-gray-700/50 flex items-center justify-between">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-[8px] font-black text-slate-400 italic">D{i}</span>
                            </div>
                          ))}
                       </div>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                         Active
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
