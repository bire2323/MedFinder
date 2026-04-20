import React from "react";
import { motion } from "framer-motion";
import { Trash2, Loader2, AlertCircle } from "lucide-react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-red-50 dark:border-red-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-red-50 dark:bg-red-900/20 flex items-center justify-center rotate-12 group hover:rotate-0 transition-all duration-500">
            <Trash2 size={48} className="text-red-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">Wait! Are you sure?</h3>
            <p className="text-slate-400 font-bold italic">
              Removing <span className="text-red-500 font-black">"{itemName}"</span> is permanent and cannot be undone.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-gray-700 rounded-2xl font-black text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={20} />}
              Confirm Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmModal;
