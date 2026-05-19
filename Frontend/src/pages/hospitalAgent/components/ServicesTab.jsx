import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Loader2, Edit2, Trash2, Stethoscope, Tag } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function ServicesTab() {
  const {
    searchServiceQuery,
    setSearchServiceQuery,
    resetServiceForm,
    setShowAddServiceModal,
    isLoading,
    services,
    openEditServiceModal,
    setSelectedService,
    setShowDeleteServiceModal
  } = useOutletContext();

  const filteredServices = services.filter(s =>
    s.service_name_en?.toLowerCase().includes(searchServiceQuery.toLowerCase()) ||
    s.service_name_am?.includes(searchServiceQuery)
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
      key="services"
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
            placeholder="Search services..."
            value={searchServiceQuery}
            onChange={(e) => setSearchServiceQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold shadow-sm text-sm text-slate-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => {
            resetServiceForm();
            setShowAddServiceModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Loading services...</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200/60 dark:border-slate-800/80"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-900">
                   <Stethoscope size={28} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-black text-base">No services found</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">Try adjusting your search query</p>
              </motion.div>
            ) : (
              filteredServices.map((service, index) => (
                <motion.div
                  key={service.id || index}
                  layout
                  variants={cardVariants}
                  className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/85 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-350 border border-blue-100/40 dark:border-blue-900/20">
                      <Stethoscope size={22} />
                    </div>
                    <div className="flex gap-1 bg-slate-50/50 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
                      <button
                        onClick={() => openEditServiceModal(service)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setShowDeleteServiceModal(true);
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
                        {service.service_name_en}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        {service.service_name_am}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-slate-950/60 text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider rounded-full border border-slate-100 dark:border-slate-850">
                        <Tag size={10} />
                        {service.service_category_name_en || "General"}
                      </div>
                      <div className="px-3 py-1 bg-blue-50/50 dark:bg-blue-950/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider rounded-full border border-blue-50 dark:border-blue-900/25">
                        {service.service_category_name_am || "ጠቅላላ"}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-850/60 flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Status</p>
                             <p className={`text-xs font-black uppercase tracking-wide ${service.is_available ? "text-emerald-500" : "text-rose-500"}`}>
                               {service.is_available ? "Available" : "Unavailable"}
                             </p>
                          </div>
                          <span className="text-[9px] font-black text-blue-500 dark:text-blue-450 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg border border-blue-100/30">
                            Verified
                          </span>
                       </div>
                       {service.notes && (
                         <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 line-clamp-2">
                           {service.notes}
                         </p>
                       )}
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
