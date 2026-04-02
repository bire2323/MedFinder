import React from "react";

function SkeletonCard() {
  return (
    <div className="rounded-2xl  border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <div className="h-20 w-20 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse rounded-full" />
          </div>
          <div className="mt-4 h-5 w-1/3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="mt-2 h-4 w-2/3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-2 ">
        <div className="h-6 w-16 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse  " />
      </div>
    </div>
  );
}

export default function ResultsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

