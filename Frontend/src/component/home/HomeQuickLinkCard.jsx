import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";

/**
 * Marketing / navigation card styled for the home hero follow-up section.
 * Mirrors FacilityCard outer chrome (rounded-2xl, shadow, border) without touching FacilityCard internals.
 */
export default function HomeQuickLinkCard({ to, title, description, icon }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={to}
        aria-label={`${title}. ${description}`}
        className="group flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg transition-all hover:border-emerald-300 hover:shadow-xl dark:border-emerald-900/50 dark:bg-gray-800 dark:hover:border-emerald-700"
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner ring-1 ring-emerald-100 transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-900">
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-gray-400">{description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-all group-hover:gap-3 dark:text-emerald-400" aria-hidden>
          <HiOutlineArrowNarrowRight className="h-5 w-5 shrink-0" />
        </span>
      </Link>
    </motion.div>
  );
}
