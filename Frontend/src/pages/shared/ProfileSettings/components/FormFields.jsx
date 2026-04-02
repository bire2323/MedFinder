import React from "react";
import { CheckCircle } from "lucide-react";

export const SectionWrapper = ({ id, title, children, theme }) => (
  <section id={id} className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-400 dark:border-gray-500 shadow-sm scroll-mt-24">
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-2 h-8 ${theme?.bgPrimary || 'bg-blue-600'} rounded-full`} />
      <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </section>
);

export const InputField = ({ label, icon, value, onChange, placeholder, error, readOnly, tooltip, theme }) => (
  <div className="space-y-2 relative group">
    <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2 ml-1">
      {icon} {label}
      {readOnly && (
         <span className={`px-2 py-0.5 flex items-center gap-1 ${theme?.badgeBg || 'bg-blue-100'} ${theme?.textPrimary || 'text-blue-600'} text-[9px] rounded-full border ${theme?.borderPrimary || 'border-blue-200'} uppercase absolute right-0 font-extrabold`}>
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
        className={`w-full p-4 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all ${
          error 
             ? "focus:ring-2 focus:ring-red-500 bg-red-50 dark:bg-red-900/10 border-red-500" 
             : readOnly 
                ? "cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-gray-800/50 dark:text-gray-400 border-slate-200 dark:border-gray-700" 
                : `bg-slate-50 dark:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-600 focus:ring-2 ${theme?.ringFocus || 'focus:ring-blue-500'}`
        }`}
      />
      {readOnly && tooltip && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl">
          {tooltip}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
        </div>
      )}
    </div>
    {error && <p className="text-[9px] text-red-500 font-bold uppercase ml-1 animate-pulse">{error}</p>}
  </div>
);

export const SelectField = ({ label, value, options, onChange, error, theme }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">{label}</label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-4 bg-slate-50 dark:bg-gray-800 border-transparent hover:border-slate-300 border rounded-2xl text-sm font-medium outline-none transition-all ${
        error ? "focus:ring-2 focus:ring-red-500 bg-red-50 dark:bg-red-900/10" : `focus:ring-2 ${theme?.ringFocus || 'focus:ring-blue-500'}`
      }`}
    >
      <option value="">Select Option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-[9px] text-red-500 font-bold uppercase ml-1 animate-pulse">{error}</p>}
  </div>
);

export const FileInput = ({ label, icon, onChange, currentFile, theme }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2 ml-1">
      {icon} {label}
    </label>
    <div className="relative">
      <input
        type="file"
        onChange={(e) => onChange(e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="w-full p-4 bg-slate-50 dark:bg-gray-800 border-2 border-dashed border-gray-400 rounded-2xl flex items-center justify-between pointer-events-none hover:bg-slate-100 transition-colors">
        <span className="text-sm font-medium text-slate-400 truncate max-w-[200px]">
          {currentFile ? (typeof currentFile === "string" ? currentFile.split("/").pop() : currentFile.name) : "No file chosen"}
        </span>
        <div className="flex items-center gap-2">
           {currentFile && <CheckCircle size={16} className={theme?.textPrimary || "text-emerald-500"} />}
           <span className="bg-white dark:bg-gray-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-sm">Browse</span>
        </div>
      </div>
    </div>
  </div>
);
