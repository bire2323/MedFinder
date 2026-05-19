import React from "react";
import { CheckCircle } from "lucide-react";

export const SectionWrapper = ({ id, title, children, theme }) => (
  <section id={id} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none scroll-mt-24">
    <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-3.5 border-b border-slate-100 dark:border-slate-800/40">
      <div className={`w-1.5 h-6 bg-gradient-to-b ${theme?.name === 'emerald' ? 'from-emerald-500 to-green-600' : 'from-blue-500 to-indigo-600'} rounded-full`} />
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-white leading-none">{title}</h3>
    </div>
    {children}
  </section>
);

export const InputField = ({ label, icon, value, onChange, placeholder, error, readOnly, tooltip, theme }) => (
  <div className="space-y-2 relative group">
    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 ml-1">
      {icon} <span>{label}</span>
      {readOnly && (
        <span className={`px-2.5 py-0.5 flex items-center gap-1 ${theme?.badgeBg || 'bg-blue-100'} ${theme?.textPrimary || 'text-blue-600'} text-[9px] rounded-full border ${theme?.borderPrimary || 'border-blue-200'} uppercase font-black tracking-wider`}>
          Read Only
        </span>
      )}
    </label>
    <div className="relative">
      <input
        value={value || ""}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl text-sm font-bold tracking-wide outline-none transition-all ${
          error
            ? "focus:ring-4 focus:ring-rose-500/10 bg-rose-50/30 dark:bg-rose-950/15 border-rose-400 focus:border-rose-500"
            : readOnly
              ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-850/45 dark:text-slate-500 border-slate-200/40 dark:border-slate-800/50"
              : `hover:border-slate-350 dark:hover:border-slate-700 focus:ring-4 ${theme?.name === 'emerald' ? 'focus:ring-emerald-500/10 focus:border-emerald-500' : 'focus:ring-blue-500/10 focus:border-blue-500'}`
        }`}
      />
      {readOnly && tooltip && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl border border-slate-800">
          {tooltip}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-800 rotate-45" />
        </div>
      )}
    </div>
    {error && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1 tracking-wider animate-pulse">{error}</p>}
  </div>
);

export const SelectField = ({ label, value, options, onChange, error, theme }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 ml-1">{label}</label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl text-sm font-bold tracking-wide outline-none transition-all appearance-none cursor-pointer ${
        error 
          ? "focus:ring-4 focus:ring-rose-500/10 bg-rose-50/30 dark:bg-rose-950/15 border-rose-400 focus:border-rose-500" 
          : `hover:border-slate-350 dark:hover:border-slate-700 focus:ring-4 ${theme?.name === 'emerald' ? 'focus:ring-emerald-500/10 focus:border-emerald-500' : 'focus:ring-blue-500/10 focus:border-blue-500'}`
      }`}
    >
      <option value="">Select Option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1 tracking-wider animate-pulse">{error}</p>}
  </div>
);

export const FileInput = ({ label, icon, onChange, currentFile, theme }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 ml-1">
      {icon} <span>{label}</span>
    </label>
    <div className="relative">
      <input
        type="file"
        onChange={(e) => onChange(e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center justify-between pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
        <span className="text-sm font-bold text-slate-400 dark:text-slate-550 truncate max-w-[200px]">
          {currentFile ? (typeof currentFile === "string" ? currentFile.split("/").pop() : currentFile.name) : "No file chosen"}
        </span>
        <div className="flex items-center gap-2">
          {currentFile && <CheckCircle size={16} className={theme?.textPrimary || "text-emerald-500"} />}
          <span className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm select-none tracking-wider text-slate-650 dark:text-slate-350">Browse</span>
        </div>
      </div>
    </div>
  </div>
);
