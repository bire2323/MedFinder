import React from "react";

/**
 * Presentational panel matching search pages (rounded-2xl border, backdrop blur).
 * Safe wrapper only — does not alter other components.
 */
export default function SurfaceCard({ children, className = "", ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur dark:border-emerald-900/35 dark:bg-slate-900/80 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
