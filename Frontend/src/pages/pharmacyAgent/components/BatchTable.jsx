import React from "react";
import { Calendar, Layers, Plus, Minus, AlertTriangle } from "lucide-react";
import { formatInventoryDate } from "../../../utils/inventoryHelpers";

export default function BatchTable({ batches, compact = false, onAdjustStock }) {
  if (!batches?.length) {
    return (
      <p className="text-xs text-slate-400 font-semibold italic py-2">
        No batch records yet.
      </p>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {batches.map((b) => (
          <span
            key={b.batch_inventory_id || b.batch_id}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${
              b.is_low_stock
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/50"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-100/50"
            }`}
          >
            <Layers size={10} />
            {b.batch_number}: {b.available}u
            {b.is_low_stock && <AlertTriangle size={10} />}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-850/30 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <th className="px-3 py-2">FIFO</th>
            <th className="px-3 py-2">Batch #</th>
            <th className="px-3 py-2">Expiry</th>
            <th className="px-3 py-2">Available</th>
            <th className="px-3 py-2">Alert at</th>
            <th className="px-3 py-2">Price</th>
            {onAdjustStock && <th className="px-3 py-2 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
          {batches.map((b, idx) => {
            const days = b.days_to_expiry ?? 0;
            const expiryClass =
              days <= 7 ? "text-rose-500" : days <= 30 ? "text-amber-500" : "text-slate-500 dark:text-slate-400";

            return (
              <tr
                key={b.batch_inventory_id || b.batch_id || idx}
                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${b.is_low_stock ? "bg-amber-50/30 dark:bg-amber-950/10" : ""}`}
              >
                <td className="px-3 py-2 font-black text-slate-400">{b.fifo_order ?? idx + 1}</td>
                <td className="px-3 py-2">
                  <span className="font-bold text-slate-800 dark:text-white">{b.batch_number}</span>
                  {b.is_low_stock && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-amber-600">
                      <AlertTriangle size={10} /> Low
                    </span>
                  )}
                </td>
                <td className={`px-3 py-2 font-semibold ${expiryClass}`}>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {formatInventoryDate(b.expiration_date)}
                    {days > 0 && <span className="text-[10px]">({days}d)</span>}
                  </span>
                </td>
                <td className="px-3 py-2 font-black text-emerald-600">{b.available}</td>
                <td className="px-3 py-2 text-slate-500 font-bold">≤ {b.low_stock_threshold ?? 10}</td>
                <td className="px-3 py-2 font-bold">{b.price}</td>
                {onAdjustStock && (
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => onAdjustStock(b, "remove")}
                        title="Remove stock"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustStock(b, "add")}
                        title="Add stock"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
