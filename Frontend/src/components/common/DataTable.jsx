import React from "react";

export default function DataTable({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = "No results",
  page = 1,
  perPage = rows?.length ?? 0,
}) {
  const startIndex = (page - 1) * perPage;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading ? (
        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/30">
              <tr>
                <th className="w-12 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  #
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-6 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-300 ${c.className || ""}`}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((r, i) => (
                <tr key={rowKey(r)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="w-12 px-4 py-4 text-sm font-medium text-gray-400 dark:text-gray-500">
                    {startIndex + i + 1}
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-100 ${c.tdClassName || ""}`}>
                      {c.render ? c.render(r) : r?.[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

