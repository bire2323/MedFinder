import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MinusCircle, X } from "lucide-react";
import { useState } from "react";

export default function DispenseModal({ drug, onClose, onSubmit, isSubmitting }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const totalStock = drug?.total_stock ?? drug?.pivot?.stock ?? drug?.inventory?.stock ?? 0;
  const batches = drug?.batches || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity < 1 || quantity > totalStock) return;
    onSubmit({ quantity: Number(quantity), reason });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200/50 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">FIFO dispense</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {drug?.brand_name_en} · {totalStock} units total
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {batches.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30 text-xs">
                <p className="font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Will use oldest batch first
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                  {batches[0]?.batch_number} (exp {batches[0]?.expiration_date})
                </p>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Quantity</label>
              <input
                type="number"
                min={1}
                max={totalStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input-premium w-full mt-1 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Sale, prescription, etc."
                className="form-input-premium w-full mt-1"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || quantity < 1 || quantity > totalStock}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <MinusCircle size={16} />}
                Dispense
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
