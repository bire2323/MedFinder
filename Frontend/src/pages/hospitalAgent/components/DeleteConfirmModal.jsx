import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100/50 flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-500">
              <Trash2 size={28} className="text-rose-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Are you sure?</h3>
              <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs leading-relaxed">
                Removing <span className="text-rose-500 font-black">"{itemName}"</span> is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-550 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Record
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
