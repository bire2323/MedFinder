import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Loader2, Edit2, Trash2, Building2 } from "lucide-react";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
  };

  return (
    <motion.div
      key="departments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchDeptQuery}
            onChange={(e) => setSearchDeptQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold shadow-sm text-sm text-slate-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => {
            resetDeptForm();
            setShowAddDeptModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Loading departments...</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredDepartments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200/60 dark:border-slate-800/80"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-900">
                   <Building2 size={28} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-black text-base">No departments found</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">Try adjusting your search query</p>
              </motion.div>
            ) : (
              filteredDepartments.map((dept, index) => (
                <motion.div
                  key={dept.id || index}
                  layout
                  variants={cardVariants}
                  className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/85 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-350 border border-blue-100/40 dark:border-blue-900/20">
                      <Building2 size={22} />
                    </div>
                    <div className="flex gap-1 bg-slate-50/50 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
                      <button
                        onClick={() => openEditDeptModal(dept)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDept(dept);
                          setShowDeleteDeptModal(true);
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-805 dark:text-white line-clamp-1 leading-snug">
                        {dept.department_name_en}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        {dept.department_name_am}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-3 py-1 bg-slate-50 dark:bg-slate-950/60 text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider rounded-full border border-slate-100 dark:border-slate-850">
                        {dept.department_category_name_en || "General"}
                      </span>
                      <span className="px-3 py-1 bg-blue-50/50 dark:bg-blue-950/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider rounded-full border border-blue-50 dark:border-blue-900/25">
                        {dept.department_category_name_am || "ጠቅላላ"}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-850/60 flex items-center justify-between">
                       <div className="flex -space-x-1.5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-850 flex items-center justify-center">
                              <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase">D{i}</span>
                            </div>
                          ))}
                       </div>
                       <span className="text-[9px] font-black text-emerald-500 dark:text-emerald-450 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-100/30">
                         Active
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
