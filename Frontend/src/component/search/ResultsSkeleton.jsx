import React from "react";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
          <div className="mt-4 h-5 w-2/3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="mt-2 h-4 w-full bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="mt-2 h-4 w-5/6 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="w-20">
          <div className="h-3 w-14 bg-slate-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-2 ">
        <div className="flex gap-x-2">
        <div className="h-6 w-20 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse  " />
      </div>
    </div>
  );
}

export default function ResultsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

