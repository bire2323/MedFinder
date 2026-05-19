import React, { useState } from "react";
import { Clock, Calendar, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WorkingHoursPicker = ({ value, onChange, theme }) => {
  const { t } = useTranslation();
  
  // Parse value if it's a string (from backend)
  const parseValue = (val) => {
    if (!val) return {};
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return parsed || {};
      } catch (e) {
        console.error('Failed to parse working_hour:', e);
        return {};
      }
    }
    return val;
  };
  
  // Initialize schedule with parsed value
  const schedule = parseValue(value) || DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
  
  const toggleSlot = (day, hour) => {
    const daySchedule = schedule[day] || [];
    const newDaySchedule = daySchedule.includes(hour)
      ? daySchedule.filter((h) => h !== hour)
      : [...daySchedule, hour];
    
    onChange({ ...schedule, [day]: newDaySchedule.sort((a, b) => a - b) });
  };
  
  const toggleFullDay = (day) => {
    const isFull = (schedule[day] || []).length === 24;
    onChange({ ...schedule, [day]: isFull ? [] : HOURS });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm shadow-slate-100/40 dark:shadow-none overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-550">
          <Clock size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t("Common.WeeklySchedule")}</span>
        </div>
        <div className="flex gap-4">
           {/* Color Legend */}
           <div className="flex items-center gap-1.5">
             <div className={`w-2.5 h-2.5 ${theme?.bgPrimary || 'bg-emerald-500'} rounded-sm shadow-sm`}></div>
             <span className="text-[9px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">Open</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 bg-white dark:bg-slate-900 rounded-sm border border-slate-200/60 dark:border-slate-800"></div>
             <span className="text-[9px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">Closed</span>
           </div>
        </div>
      </div>

      <div className="min-w-[800px]">
        {/* Hour Headers */}
        <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 mb-2">
          <div></div>
          {HOURS.map((h) => (
            <div key={h} className="text-[9px] text-slate-400 dark:text-slate-500 font-bold text-center">
              {h}:00
            </div>
          ))}
        </div>

        {/* Day Rows */}
        {DAYS.map((day) => (
          <div key={day} className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 items-center mb-1 group">
            <button
              type="button"
              onClick={() => toggleFullDay(day)}
              className={`text-[10px] font-black uppercase text-left py-1 tracking-widest text-slate-500 dark:text-slate-400 ${theme?.textPrimary ? `hover:${theme.textPrimary}` : 'hover:text-emerald-500'} transition-colors cursor-pointer`}
            >
              {t(`Common.${day}`)}
            </button>
            {HOURS.map((h) => {
              const isOpen = schedule[day]?.includes(h);
              return (
                <motion.button
                  key={h}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => toggleSlot(day, h)}
                  className={`h-7 rounded-md transition-all duration-200 border cursor-pointer
                    ${isOpen 
                      ? `${theme?.bgPrimary || 'bg-emerald-500'} border-transparent shadow-sm shadow-emerald-500/10` 
                      : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  title={`${day} ${h}:00`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3.5 ${theme?.bgLight || 'bg-emerald-50 dark:bg-emerald-950/40'} rounded-xl flex items-center gap-3 ${theme?.textPrimary || 'text-emerald-600 dark:text-emerald-450'} border border-emerald-500/10`}>
        <AlertCircle size={16} />
        <p className="text-xs font-semibold leading-relaxed">
          Click individual blocks to toggle hours, or click the day name to toggle 24h service for that day.
        </p>
      </div>
    </div>
  );
};

export default WorkingHoursPicker;
