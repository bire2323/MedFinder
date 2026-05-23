import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package, Plus, Minus, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function BatchAdjustModal({ batch, initialMode = "add", onClose, onSubmit, isSubmitting }) {
  const [mode, setMode] = useState(initialMode);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [batchThreshold, setBatchThreshold] = useState(
    String(batch?.batch_low_stock_threshold ?? batch?.low_stock_threshold ?? 10)
  );

  useEffect(() => {
    setMode(initialMode);
    setAmount("");
    setReason("");
  }, [initialMode, batch]);

  const current = batch?.available ?? 0;
  const parsed = parseInt(amount, 10) || 0;
  const change = mode === "add" ? parsed : -parsed;
  const preview = Math.max(0, current + (parsed ? change : 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsed < 1) return;
    if (mode === "remove" && parsed > current) return;

    onSubmit({
      quantity_change: change,
      reason: reason || (mode === "add" ? "Stock received" : "Stock removed"),
      low_stock_threshold: parseInt(batchThreshold, 10) || undefined,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200/50 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <Package size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Adjust batch stock</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {batch?.batch_number} · Current: <strong className="text-emerald-600">{current}</strong> units
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  mode === "add"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                <Plus size={14} /> Add stock
              </button>
              <button
                type="button"
                onClick={() => setMode("remove")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  mode === "remove"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-slate-500 hover:text-rose-500"
                }`}
              >
                <Minus size={14} /> Remove
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                {mode === "add" ? "Units to add" : "Units to remove"}
              </label>
              <input
                type="number"
                min={1}
                max={mode === "remove" ? current : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50"
                className="form-input-premium w-full mt-1 font-bold text-lg"
                required
                autoFocus
              />
              {parsed > 0 && (
                <p className="text-xs font-bold text-slate-500 mt-2 pl-1">
                  New total: <span className="text-emerald-600">{preview}</span> units
                  <span className="text-slate-400 font-semibold ml-1">
                    ({current} {change > 0 ? "+" : ""}{change})
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                Low stock alert for this batch
              </label>
              <input
                type="number"
                min={0}
                value={batchThreshold}
                onChange={(e) => setBatchThreshold(e.target.value)}
                className="form-input-premium w-full mt-1 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1 pl-1">
                Alert triggers automatically when batch stock ≤ this number
              </p>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Delivery, correction, damaged goods..."
                className="form-input-premium w-full mt-1"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || parsed < 1 || (mode === "remove" && parsed > current)}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase text-white flex items-center justify-center gap-2 disabled:opacity-50 ${
                  mode === "add"
                    ? "bg-gradient-to-r from-emerald-500 to-green-600"
                    : "bg-gradient-to-r from-rose-500 to-red-600"
                }`}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : mode === "add" ? <Plus size={16} /> : <Minus size={16} />}
                {mode === "add" ? "Add units" : "Remove units"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
