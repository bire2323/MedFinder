import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  disabled = false,
  windowSize = 2,
}) {
  const pages = useMemo(() => {
    if (!totalPages || totalPages <= 1) return [];

    const safePage = clamp(page, 1, totalPages);
    const start = Math.max(1, safePage - windowSize);
    const end = Math.min(totalPages, safePage + windowSize);

    const out = [];
    if (start > 1) out.push(1);
    if (start > 2) out.push("…");
    for (let p = start; p <= end; p += 1) out.push(p);
    if (end < totalPages - 1) out.push("…");
    if (end < totalPages) out.push(totalPages);
    return out;
  }, [page, totalPages, windowSize]);

  if (!totalPages || totalPages <= 1) return null;

  const baseBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={`${baseBtn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <div key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-500 dark:text-gray-400">
            …
          </div>
        ) : (
          <button
            key={p}
            type="button"
            className={`${baseBtn} ${
              p === page
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => onChange(p)}
            disabled={disabled}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className={`${baseBtn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

